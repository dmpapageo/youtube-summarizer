import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { YoutubeTranscript } from "youtube-transcript";

const anthropic = new Anthropic();

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  const videoId = extractVideoId(url);
  if (!videoId) {
    return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let transcript: string;
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    transcript = segments.map((s) => s.text).join(" ");
  } catch {
    return new Response(
      JSON.stringify({ error: "Could not fetch transcript. The video may not have captions." }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  const stream = await anthropic.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    system: "You are an expert at summarizing YouTube video transcripts. Provide clear, structured summaries with key points and takeaways.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Please summarize the following YouTube video transcript:\n\n${transcript}`,
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text: "Provide a concise summary with: 1) A brief overview (2-3 sentences), 2) Key points (bullet list), 3) Main takeaways.",
          },
        ],
      },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

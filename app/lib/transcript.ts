// Pure helpers for the summarize route. No Next, no SDK — so they can be unit-tested directly.

export function extractVideoId(url: string): string | null {
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

// Cap on transcript size sent to Claude. ~600k characters is roughly 150k tokens —
// far beyond any normal video (a 3-hour talk is ~200k characters) — so this only
// stops pathological pastes and runaway cost, never real videos.
export const MAX_TRANSCRIPT_CHARS = 600_000;

export function transcriptTooLong(transcript: string): boolean {
  return transcript.length > MAX_TRANSCRIPT_CHARS;
}

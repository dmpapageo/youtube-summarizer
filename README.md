# YouTube Summarizer

A Next.js web app that generates AI-powered summaries of YouTube videos. Paste a YouTube URL (or the transcript itself) and get a structured summary: overview, key points, and takeaways, streamed in real time.

## Try it live

Go to **[youtube-summarizer-sooty-mu.vercel.app](https://youtube-summarizer-sooty-mu.vercel.app/)** and bring your own Anthropic API key.

## Demo

https://github.com/user-attachments/assets/b15f3611-d44f-4c01-8144-fd8cc8765971

## How it works

1. You paste a YouTube URL, or paste the transcript directly
2. If no transcript was pasted, the app fetches it via `youtube-transcript`
3. The transcript is sent to Claude (Anthropic) with prompt caching enabled to reduce cost on long videos
4. The summary streams back word-by-word and renders as formatted markdown

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript): Claude Opus 4.8 with adaptive thinking, streaming, and prompt caching
- [youtube-transcript](https://www.npmjs.com/package/youtube-transcript)
- [react-markdown](https://github.com/remarkjs/react-markdown)

## Running Locally

### 1. Clone the repo

```bash
git clone https://github.com/dmpapageo/youtube-summarizer.git
cd youtube-summarizer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser, then paste in your own Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com)). It's used only for that request and is never stored.

## Testing

`npm test` runs 10 unit tests with Node's built-in runner and its built-in mocks (no extra dependencies), fully offline:

- YouTube URL parsing for every supported shape (`watch?v=`, `youtu.be` share links, embed, Shorts, live, bare ids) and rejection of non-video URLs
- The transcript length guard at the cap
- All 7 of the API route's error paths: 401 for a missing key, 401 for a malformed key, 400 for a non-YouTube URL, 422 when the transcript can't be fetched, 413 for a transcript over the cap, 502 when the Anthropic request fails to start, and an interrupted summary stream (partial text kept, error note appended)

The YouTube fetch and the Anthropic stream are replaced with mocks and global `fetch` is stubbed to throw, so no key or network is involved. GitHub Actions runs `npm test`, `npm run lint`, and `npm run build` on every push.

## Evaluation

A copy of this app's summarization prompt and model settings is scored in a separate eval harness, [llm-eval-harness](https://github.com/dmpapageo/llm-eval-harness), where an LLM judge grades summaries of fixed transcripts for faithfulness. It caught Claude adding an unsupported "safer" claim to an mRNA-vaccine summary. The grounding instruction that fixed it there (back to 5 of 5 cases passing, mean faithfulness 5.00) was ported to this app's system prompt in commit `ecbc88c`.

## Notes

- Transcripts over 600,000 characters (~150k tokens, well beyond any normal video) are rejected with a 413 before the Anthropic client is created, so a pathological paste can't run up your bill (covered by a unit test)
- The video must have captions or subtitles available; auto-generated captions work fine
- If the URL fetch fails (missing captions, or YouTube rate-limiting), paste the transcript directly instead
- Prompt caching is enabled, so summarizing the same long transcript again within a few minutes costs less

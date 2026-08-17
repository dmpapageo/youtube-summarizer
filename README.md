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
- [Anthropic SDK](https://github.com/anthropic/anthropic-sdk-typescript) - Claude Opus 4.8 with adaptive thinking + streaming + prompt caching
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

Open [http://localhost:3000](http://localhost:3000) in your browser, then paste in your own Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com)) - it's used only for that request and is never stored.

## Testing

`npm test` runs the unit tests with Node's built-in runner (no extra dependencies): YouTube URL parsing for every supported shape, the transcript length guard, and the API route's error paths — 401 for a missing or malformed key, 400 for a non-YouTube URL, 413 for a transcript over the cap — all of which return before an Anthropic client is created, so no key or network is involved. GitHub Actions runs `npm test`, `npm run lint`, and `npm run build` on every push.

## Notes

- Transcripts over 600,000 characters (~150k tokens, well beyond any normal video) are rejected with a 413 before any API call, so a pathological paste can't run up your bill
- The video must have captions/subtitles available - auto-generated captions work fine
- If the URL fetch fails (missing captions, or YouTube rate-limiting), paste the transcript directly instead
- Prompt caching is enabled, so summarizing the same video twice is significantly cheaper

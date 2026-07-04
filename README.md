# YouTube Summarizer

A Next.js web app that generates AI-powered summaries of YouTube videos. Paste a YouTube URL (or the transcript itself) and get a structured summary — overview, key points, and takeaways — streamed in real time.

## Try it live

No need to run it locally to try it out — just go to **[youtube-summarizer-sooty-mu.vercel.app](https://youtube-summarizer-sooty-mu.vercel.app/)** and bring your own Anthropic API key.

## Demo

<!-- TODO: paste the demo .mp4 (or its GitHub asset link) here -->

## How it works

1. You paste a YouTube URL, or paste the transcript directly
2. If no transcript was pasted, the app fetches it via `youtube-transcript`
3. The transcript is sent to Claude (Anthropic) with prompt caching enabled to reduce cost on long videos
4. The summary streams back word-by-word and renders as formatted markdown

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com)
- [Anthropic SDK](https://github.com/anthropic/anthropic-sdk-typescript) — Claude Opus 4.7 with adaptive thinking + streaming
- [youtube-transcript](https://www.npmjs.com/package/youtube-transcript)
- [react-markdown](https://github.com/remarkjs/react-markdown)

## Getting started

Prefer to run it yourself instead of using the [live demo](#try-it-live)? Here's how:

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

Open [http://localhost:3000](http://localhost:3000) in your browser, then paste in your own Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com)) — it's used only for that request and is never stored.

## Notes

- The video must have captions/subtitles available — auto-generated captions work fine
- If the URL fetch fails (missing captions, or YouTube rate-limiting), paste the transcript directly instead
- Prompt caching is enabled, so summarizing the same video twice is significantly cheaper

## Screenshot

<img width="787" height="969" alt="image" src="https://github.com/user-attachments/assets/87729d02-c55b-4d2c-bad9-17d82f2ba9f6" />


// Pure helpers for the summarize route. No Next, no SDK, so they can be unit-tested directly.

// YouTube video ids are exactly 11 characters from this set.
const ID = "[A-Za-z0-9_-]{11}";
const END = "(?![A-Za-z0-9_-])";

const VIDEO_ID_PATTERNS = [
  // A bare id.
  new RegExp(`^(${ID})$`),
  // youtube.com/watch?v=ID, with v anywhere in the query (www., m. and music. hosts included).
  new RegExp(`youtube\\.com/watch\\?(?:[^#]*&)?v=(${ID})${END}`),
  // youtu.be/ID share links, which usually carry ?si=...
  new RegExp(`youtu\\.be/(${ID})${END}`),
  // Path-style links: embed, Shorts and live.
  new RegExp(`youtube\\.com/(?:embed|shorts|live)/(${ID})${END}`),
];

export function extractVideoId(url: string): string | null {
  for (const pattern of VIDEO_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Cap on transcript size sent to Claude. ~600k characters is roughly 150k tokens,
// far beyond any normal video (a 3-hour talk is ~200k characters), so this only
// stops pathological pastes and runaway cost, never real videos.
export const MAX_TRANSCRIPT_CHARS = 600_000;

export function transcriptTooLong(transcript: string): boolean {
  return transcript.length > MAX_TRANSCRIPT_CHARS;
}

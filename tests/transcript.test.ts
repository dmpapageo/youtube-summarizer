import { test } from "node:test";
import assert from "node:assert/strict";
import { extractVideoId, MAX_TRANSCRIPT_CHARS, transcriptTooLong } from "../app/lib/transcript.ts";

const ID = "dQw4w9WgXcQ";

test("extracts the id from every supported URL shape", () => {
  const urls = [
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&t=42s`,
    `https://www.youtube.com/watch?feature=share&v=${ID}`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=abc`,
    `https://youtu.be/${ID}?si=AbC123xyz&t=10`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://youtube.com/shorts/${ID}?si=abc`,
    `https://www.youtube.com/live/${ID}`,
    `https://www.youtube.com/live/${ID}?si=abc`,
    ID,
  ];
  // Collect every mismatch so a failure lists all broken shapes, not just the first.
  const wrong = urls.map((url) => [url, extractVideoId(url)]).filter(([, id]) => id !== ID);
  assert.deepEqual(wrong, []);
});

test("rejects things that are not YouTube videos", () => {
  for (const bad of [
    "",
    "https://vimeo.com/12345",
    "not a url",
    "https://youtube.com/",
    "tooshort",
    "https://www.youtube.com/shorts/",
    "https://www.youtube.com/watch?list=PL123",
  ]) {
    assert.equal(extractVideoId(bad), null, bad);
  }
});

test("length guard trips only above the cap", () => {
  assert.equal(transcriptTooLong("x".repeat(MAX_TRANSCRIPT_CHARS)), false);
  assert.equal(transcriptTooLong("x".repeat(MAX_TRANSCRIPT_CHARS + 1)), true);
});

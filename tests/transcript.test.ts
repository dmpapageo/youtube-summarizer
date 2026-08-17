import { test } from "node:test";
import assert from "node:assert/strict";
import { extractVideoId, MAX_TRANSCRIPT_CHARS, transcriptTooLong } from "../app/lib/transcript.ts";

const ID = "dQw4w9WgXcQ";

test("extracts the id from every supported URL shape", () => {
  for (const url of [
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&t=42s`,
    `https://www.youtube.com/watch?feature=share&v=${ID}`.replace("feature=share&v=", "v="),
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=abc`,
    `https://www.youtube.com/embed/${ID}`,
    ID,
  ]) {
    assert.equal(extractVideoId(url), ID, url);
  }
});

test("rejects things that are not YouTube videos", () => {
  for (const bad of ["", "https://vimeo.com/12345", "not a url", "https://youtube.com/", "tooshort"]) {
    assert.equal(extractVideoId(bad), null, bad);
  }
});

test("length guard trips only above the cap", () => {
  assert.equal(transcriptTooLong("x".repeat(MAX_TRANSCRIPT_CHARS)), false);
  assert.equal(transcriptTooLong("x".repeat(MAX_TRANSCRIPT_CHARS + 1)), true);
});

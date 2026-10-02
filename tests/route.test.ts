import { afterEach, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import Anthropic from "@anthropic-ai/sdk";
import { YoutubeTranscript } from "youtube-transcript";
import { POST } from "../app/api/summarize/route.ts";
import { MAX_TRANSCRIPT_CHARS } from "../app/lib/transcript.ts";

// No real key, network, or YouTube call is involved. The first four cases return
// before an Anthropic client is created. The last three replace the YouTube fetch
// and the Anthropic stream with node:test mocks, and global fetch is stubbed to
// throw, so any call that slipped past a mock would fail the test, not go online.

beforeEach(() => {
  mock.method(globalThis, "fetch", async () => {
    throw new Error("network is disabled in tests");
  });
});

afterEach(() => {
  mock.restoreAll();
});

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never
  );
}

async function expectJsonError(res: Response, status: number, contains: string) {
  assert.equal(res.status, status);
  const json = await res.json();
  assert.match(json.error, new RegExp(contains, "i"));
}

test("401 when the API key is missing or blank", async () => {
  await expectJsonError(await post({ url: "https://youtu.be/dQw4w9WgXcQ" }), 401, "enter your anthropic api key");
  await expectJsonError(await post({ url: "https://youtu.be/dQw4w9WgXcQ", apiKey: "   " }), 401, "enter your anthropic api key");
});

test("401 when the API key has the wrong shape", async () => {
  await expectJsonError(await post({ url: "https://youtu.be/dQw4w9WgXcQ", apiKey: "sk-openai-123" }), 401, "invalid api key format");
});

test("400 when the URL is not a YouTube video and no transcript was pasted", async () => {
  await expectJsonError(await post({ url: "https://vimeo.com/123", apiKey: "sk-ant-test" }), 400, "invalid youtube url");
});

test("413 when a pasted transcript exceeds the cap, before any API call", async () => {
  const res = await post({ apiKey: "sk-ant-test", transcript: "word ".repeat(MAX_TRANSCRIPT_CHARS / 5 + 1) });
  await expectJsonError(res, 413, "too long");
});

test("422 when the YouTube transcript cannot be fetched", async () => {
  const fetchTranscript = mock.method(YoutubeTranscript, "fetchTranscript", async () => {
    throw new Error("captions disabled");
  });
  const res = await post({ url: "https://youtu.be/dQw4w9WgXcQ", apiKey: "sk-ant-test" });
  await expectJsonError(res, 422, "could not fetch transcript");
  assert.equal(fetchTranscript.mock.callCount(), 1);
  assert.equal(fetchTranscript.mock.calls[0].arguments[0], "dQw4w9WgXcQ");
});

test("502 when the Anthropic request cannot be started", async () => {
  const stream = mock.method(Anthropic.Messages.prototype, "stream", () => {
    throw new Error("401 unauthorized");
  });
  const res = await post({ apiKey: "sk-ant-test", transcript: "a short transcript" });
  await expectJsonError(res, 502, "summarization failed");
  assert.equal(stream.mock.callCount(), 1);
});

test("an interrupted summary stream keeps the text so far and appends an error note", async () => {
  const stream = mock.method(Anthropic.Messages.prototype, "stream", () =>
    (async function* () {
      yield { type: "content_block_delta", delta: { type: "text_delta", text: "Partial summary" } };
      throw new Error("connection reset");
    })()
  );
  const res = await post({ apiKey: "sk-ant-test", transcript: "a short transcript" });
  assert.equal(res.status, 200);
  assert.equal(await res.text(), "Partial summary\n\n[Error: the summary stream was interrupted.]");
  assert.equal(stream.mock.callCount(), 1);
});

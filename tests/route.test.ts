import { test } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/summarize/route.ts";
import { MAX_TRANSCRIPT_CHARS } from "../app/lib/transcript.ts";

// Every case here returns before an Anthropic client is created, so no key,
// no network, and no YouTube call is involved.

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

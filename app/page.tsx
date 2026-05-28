"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setSummary("");
    setError("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setSummary((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Request failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleStop() {
    abortRef.current?.abort();
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">YouTube Summarizer</h1>
          <p className="text-gray-400">Paste a YouTube URL and get an AI-powered summary instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {loading ? (
            <button
              type="button"
              onClick={handleStop}
              className="rounded-lg bg-gray-700 hover:bg-gray-600 px-5 py-3 text-sm font-medium transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!url.trim()}
              className="rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-3 text-sm font-medium transition-colors"
            >
              Summarize
            </button>
          )}
        </form>

        {error && (
          <div className="rounded-lg bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading && !summary && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-gray-300" />
            Fetching transcript and generating summary…
          </div>
        )}

        {summary && (
          <div className="rounded-lg bg-gray-900 border border-gray-800 px-6 py-5">
            <div className="text-sm leading-relaxed text-gray-200">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mt-4 mb-2 text-white">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold mt-3 mb-1 text-white">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-base font-semibold mt-3 mb-1 text-white">{children}</h4>,
                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-200">{children}</li>,
                  p: ({ children }) => <p className="mb-2">{children}</p>,
                }}
              >
                {summary}
              </ReactMarkdown>
              {loading && <span className="animate-pulse ml-0.5">▋</span>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

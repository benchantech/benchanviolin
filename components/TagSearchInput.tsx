"use client";

import { useEffect, useMemo, useState } from "react";

type Result = {
  result_type: "tag";
  slug: string;
  label: string;
  group_label: string;
  description: string;
  learner_prompt: string;
  clip_count: number;
  match_type: string;
  match_text: string;
};

type SegmentResult = {
  result_type: "segment";
  segment_id: string;
  segment_title: string;
  timestamp_label: string;
  start_url: string;
  video_title: string;
  match_type: "transcript_context";
  match_text: string;
};

type SearchResult = Result | SegmentResult;

const examples = ["fifths", "bow bounce", "tense bow hand", "string changes", "snap pizzicato"];

function matchReason(result: Result) {
  if (result.match_type.includes("alias")) return `matched "${result.match_text}"`;
  if (result.match_type.includes("prefix")) return `prefix match "${result.match_text}"`;
  return `matched "${result.match_text}"`;
}

export function TagSearchInput() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/tags/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { results: SearchResult[] };
        setResults(data.results);
      } catch (error) {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery]);

  return (
    <div className="tag-search" role="search">
      <label htmlFor="library-search">What are you working on?</label>
      <div className="tag-search__control">
        <input
          id="library-search"
          type="search"
          value={query}
          placeholder="Search a technique or practice problem"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="suggested-tags" aria-label="Suggested searches">
        {examples.map((example) => (
          <button key={example} type="button" onClick={() => setQuery(example)}>
            {example}
          </button>
        ))}
      </div>

      {trimmedQuery ? (
        <div className="search-results" aria-live="polite">
          {loading ? <p className="fine-print">Searching...</p> : null}
          {!loading && results.length === 0 ? <p className="fine-print">No matching tags or transcript context yet.</p> : null}
          {results.map((result) => (
            result.result_type === "tag" ? (
              <a className="search-result" key={result.slug} href={`/library/tags/${result.slug}`}>
                <span>
                  <b>{result.label}</b>
                  <small>{matchReason(result)}</small>
                </span>
                <em>{result.clip_count} clips</em>
              </a>
            ) : (
              <a className="search-result transcript-hit" key={result.segment_id} href={result.start_url}>
                <span>
                  <b>{result.segment_title}</b>
                  <small>
                    Transcript context: "{result.match_text}"
                  </small>
                  <small>
                    {result.video_title} · {result.timestamp_label}
                  </small>
                </span>
                <em>Clip</em>
              </a>
            )
          ))}
        </div>
      ) : null}
    </div>
  );
}

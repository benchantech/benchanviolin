"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  isSafeAnalyticsSearchTerm,
  normalizeAnalyticsString,
  trackEvent,
  trackLibraryResultClick,
  trackLibrarySearch,
  type RoutingOutcome,
} from "@/lib/analytics";

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

type GovernedRoute = {
  routeId: string;
  label: string;
  domain: string;
  summary: string;
  firstAction: string;
  verification: string;
  stopCondition: string;
  searchTerms: string[];
};

type BranchOption = {
  id: string;
  label: string;
};

type SearchResponse = {
  kind?: "DIRECT" | "BRANCH" | "CONFIRM" | "FALLBACK";
  authority?: "governed" | "archive";
  normalizedQuery?: string;
  route?: GovernedRoute;
  branch?: {
    prompt: string;
    options: BranchOption[];
  };
  candidates?: { routeId: string; label: string }[];
  results?: SearchResult[];
};

type SearchState = {
  results: SearchResult[];
  response: SearchResponse | null;
};

const examples = ["fifths", "bow bounce", "tense bow hand", "string changes", "snap pizzicato"];
const minSearchLength = 2;
const loadingDelayMs = 160;

function debounceMsFor(query: string) {
  if (query.length < 5) return 320;
  if (query.length < 12) return 240;
  return 180;
}

function matchReason(result: Result) {
  if (result.match_type.includes("alias")) return `matched "${result.match_text}"`;
  if (result.match_type.includes("prefix")) return `prefix match "${result.match_text}"`;
  return `matched "${result.match_text}"`;
}

function routingOutcomeFor(response: SearchResponse, resultCount: number): RoutingOutcome {
  if (response.kind === "DIRECT") return "governed_direct";
  if (response.kind === "BRANCH") return "governed_branch";
  if (response.kind === "CONFIRM") return "governed_confirm";
  if (resultCount === 0) return "no_results";
  return "archive_fallback";
}

function governedRouteId(response: SearchResponse) {
  return response.route?.routeId ?? response.candidates?.[0]?.routeId;
}

function resultIdFor(result: SearchResult) {
  return result.result_type === "tag" ? result.slug : result.segment_id;
}

function visibleResultCount(response: SearchResponse, resultCount: number) {
  if (response.kind === "DIRECT" || response.kind === "BRANCH") return 1;
  if (response.kind === "CONFIRM") return response.candidates?.length ?? 0;
  return resultCount;
}

export function TagSearchInput({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const firstResultRef = useRef<HTMLAnchorElement | null>(null);
  const shouldScrollToInitialResult = useRef(Boolean(initialQuery.trim()));
  const cacheRef = useRef(new Map<string, SearchState>());
  const inFlightRef = useRef(new Map<string, Promise<SearchState>>());
  const requestIdRef = useRef(0);
  const trackedSearchesRef = useRef(new Set<string>());
  const branchRequestIdRef = useRef(0);

  const trimmedQuery = useMemo(() => query.trim(), [query]);
  const normalizedQuery = useMemo(() => trimmedQuery.toLowerCase().replace(/\s+/g, " "), [trimmedQuery]);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!normalizedQuery) {
      setResults([]);
      setSearchResponse(null);
      setLoading(false);
      return;
    }

    if (normalizedQuery.length < minSearchLength) {
      setResults([]);
      setSearchResponse(null);
      setLoading(false);
      return;
    }

    const cached = cacheRef.current.get(normalizedQuery);
    if (cached) {
      setResults(cached.results);
      setSearchResponse(cached.response);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const loadingTimer = window.setTimeout(() => {
      if (requestIdRef.current === requestId) setLoading(true);
    }, loadingDelayMs);
    const searchTimer = window.setTimeout(async () => {
      try {
        let request = inFlightRef.current.get(normalizedQuery);

        if (!request) {
          request = fetch(`/api/tags/search?q=${encodeURIComponent(normalizedQuery)}`, {
            signal: controller.signal,
          })
            .then(async (response) => {
              if (!response.ok) return { results: [], response: null };
              const data = (await response.json()) as SearchResponse;
              return {
                results: Array.isArray(data.results) ? data.results : [],
                response: data,
              };
            })
            .finally(() => {
              inFlightRef.current.delete(normalizedQuery);
            });
          inFlightRef.current.set(normalizedQuery, request);
        }

        const nextState = await request;
        cacheRef.current.set(normalizedQuery, nextState);

        if (requestIdRef.current === requestId) {
          setResults(nextState.results);
          setSearchResponse(nextState.response);

          if (nextState.response && !trackedSearchesRef.current.has(normalizedQuery)) {
            const outcome = routingOutcomeFor(nextState.response, nextState.results.length);
            trackedSearchesRef.current.add(normalizedQuery);
            trackLibrarySearch({
              search_term: normalizedQuery,
              result_count: visibleResultCount(nextState.response, nextState.results.length),
              routing_outcome: outcome,
              route_id: governedRouteId(nextState.response),
            });
          }
        }
      } catch (error) {
        if (!controller.signal.aborted && requestIdRef.current === requestId) {
          setResults([]);
          setSearchResponse(null);
        }
      } finally {
        window.clearTimeout(loadingTimer);
        if (!controller.signal.aborted && requestIdRef.current === requestId) setLoading(false);
      }
    }, debounceMsFor(normalizedQuery));

    return () => {
      window.clearTimeout(searchTimer);
      window.clearTimeout(loadingTimer);
      controller.abort();
    };
  }, [normalizedQuery]);

  useEffect(() => {
    if (!shouldScrollToInitialResult.current || loading || results.length === 0) return;

    shouldScrollToInitialResult.current = false;
    window.requestAnimationFrame(() => {
      firstResultRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }, [loading, results.length]);

  const routingOutcome = searchResponse ? routingOutcomeFor(searchResponse, results.length) : undefined;
  const routeId = searchResponse ? governedRouteId(searchResponse) : undefined;
  const canTrackCurrentQuery = isSafeAnalyticsSearchTerm(normalizedQuery);

  async function applyGovernedChoice(url: string) {
    const choiceRequestId = branchRequestIdRef.current + 1;
    branchRequestIdRef.current = choiceRequestId;
    setLoading(true);

    try {
      const response = await fetch(url);
      if (!response.ok) return;
      const data = (await response.json()) as SearchResponse;
      if (branchRequestIdRef.current !== choiceRequestId) return;
      setResults(Array.isArray(data.results) ? data.results : []);
      setSearchResponse(data);
    } finally {
      if (branchRequestIdRef.current === choiceRequestId) setLoading(false);
    }
  }

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
          {!loading && searchResponse?.route ? (
            <a
              className="search-result"
              href={`/library?q=${encodeURIComponent(searchResponse.route.searchTerms[0] ?? normalizedQuery)}`}
              onClick={() => {
                const route = searchResponse.route;
                if (!routingOutcome || !canTrackCurrentQuery || !route) return;
                trackLibraryResultClick({
                  search_term: normalizedQuery,
                  routing_outcome: routingOutcome,
                  route_id: route.routeId,
                  result_type: "governed_route",
                  result_id: route.routeId,
                  result_position: 1,
                });
              }}
            >
              <span>
                <b>{searchResponse.route.label}</b>
                <small>{searchResponse.route.summary}</small>
              </span>
              <em>{searchResponse.kind?.toLowerCase()}</em>
            </a>
          ) : null}
          {!loading && searchResponse?.branch ? (
            <div className="search-result transcript-hit">
              <span>
                <b>{searchResponse.branch.prompt}</b>
                <small>
                  {searchResponse.branch.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        const currentRouteId = searchResponse.route?.routeId;
                        if (!currentRouteId) return;
                        if (canTrackCurrentQuery) {
                          trackEvent("technical_branch_choice", {
                            search_term: normalizedQuery,
                            routing_outcome: "governed_branch",
                            route_id: currentRouteId,
                            branch_option: option.id,
                          });
                        }
                        applyGovernedChoice(
                          `/api/tags/search?routeId=${encodeURIComponent(currentRouteId)}&branchOption=${encodeURIComponent(option.id)}`,
                        );
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </small>
              </span>
              <em>Choose</em>
            </div>
          ) : null}
          {!loading && searchResponse?.kind === "CONFIRM" && searchResponse.candidates?.length ? (
            <div className="search-result transcript-hit">
              <span>
                <b>Choose the problem you mean</b>
                <small>
                  {searchResponse.candidates.map((candidate) => (
                    <button
                      key={candidate.routeId}
                      type="button"
                      onClick={() => {
                        if (canTrackCurrentQuery) {
                          trackEvent("technical_branch_choice", {
                            search_term: normalizedQuery,
                            routing_outcome: "governed_confirm",
                            route_id: candidate.routeId,
                            branch_option: candidate.routeId,
                          });
                        }
                        applyGovernedChoice(
                          `/api/tags/search?confirmRouteId=${encodeURIComponent(candidate.routeId)}`,
                        );
                      }}
                    >
                      {candidate.label}
                    </button>
                  ))}
                </small>
              </span>
              <em>Confirm</em>
            </div>
          ) : null}
          {!loading && normalizedQuery.length >= minSearchLength && !searchResponse?.route && searchResponse?.kind !== "CONFIRM" && results.length === 0 ? (
            <p className="fine-print">No matching tags or transcript context yet.</p>
          ) : null}
          {results.map((result, index) => (
            result.result_type === "tag" ? (
              <a
                className="search-result"
                key={result.slug}
                href={`/library/tags/${result.slug}`}
                ref={index === 0 ? firstResultRef : undefined}
                onClick={() => {
                  if (!routingOutcome || !canTrackCurrentQuery) return;
                  trackLibraryResultClick({
                    search_term: normalizeAnalyticsString(normalizedQuery),
                    routing_outcome: routingOutcome,
                    route_id: routeId,
                    result_type: "tag",
                    result_id: resultIdFor(result),
                    result_position: index + 1,
                  });
                }}
              >
                <span>
                  <b>{result.label}</b>
                  <small>{matchReason(result)}</small>
                </span>
                <em>{result.clip_count} clips</em>
              </a>
            ) : (
              <a
                className="search-result transcript-hit"
                key={result.segment_id}
                href={result.start_url}
                ref={index === 0 ? firstResultRef : undefined}
                onClick={() => {
                  if (!routingOutcome || !canTrackCurrentQuery) return;
                  trackLibraryResultClick({
                    search_term: normalizeAnalyticsString(normalizedQuery),
                    routing_outcome: routingOutcome,
                    route_id: routeId,
                    result_type: "segment",
                    result_id: resultIdFor(result),
                    result_position: index + 1,
                    segment_id: result.segment_id,
                  });
                }}
              >
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

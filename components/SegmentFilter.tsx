"use client";

import { useMemo, useState } from "react";
import { SegmentCard } from "@/components/SegmentCard";
import type { Segment } from "@/lib/segments";

function normalizeForSearch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function searchableSegmentText(segment: Segment) {
  return normalizeForSearch(
    [
      segment.segment_title,
      segment.timestamp_label,
      segment.review_status,
      segment.video_title,
      segment.use_when,
      segment.teaching_summary,
      segment.suggested_experiment,
      segment.reflection_prompt,
      segment.contextual_clues.join(" "),
      segment.tags.map((tag) => `${tag.label} ${tag.slug}`).join(" "),
    ].join(" "),
  );
}

export function SegmentFilter({ tagLabel, segments }: { tagLabel: string; segments: Segment[] }) {
  const [query, setQuery] = useState("");

  const indexedSegments = useMemo(
    () => segments.map((segment) => ({ segment, text: searchableSegmentText(segment) })),
    [segments],
  );

  const filteredSegments = useMemo(() => {
    const tokens = normalizeForSearch(query).split(" ").filter(Boolean);
    if (tokens.length === 0) return segments;

    return indexedSegments
      .filter(({ text }) => tokens.every((token) => text.includes(token)))
      .map(({ segment }) => segment);
  }, [indexedSegments, query, segments]);

  return (
    <section className="section segment-list" aria-label={`${tagLabel} reviewed clips`}>
      <div className="segment-filter">
        <label htmlFor="segment-filter">Filter clips</label>
        <input
          id="segment-filter"
          type="search"
          value={query}
          placeholder="control, bow hand, ai proposed"
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className="fine-print" aria-live="polite">
          Filtered results: {filteredSegments.length}
        </p>
      </div>

      {filteredSegments.map((segment) => (
        <SegmentCard key={segment.segment_id} segment={segment} />
      ))}
    </section>
  );
}

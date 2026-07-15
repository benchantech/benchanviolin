"use client";

import { useState } from "react";
import type { Segment } from "@/lib/segments";
import { trackEvent } from "@/lib/analytics";
import { getYouTubeWatchUrl } from "@/lib/youtube";
import { YouTubeSegmentEmbed } from "@/components/YouTubeSegmentEmbed";

export function SegmentCard({ segment }: { segment: Segment }) {
  const [isWatching, setIsWatching] = useState(false);
  const trackVideoStart = () => {
    trackEvent("video_start", {
      result_type: "segment",
      result_id: segment.segment_id,
      segment_id: segment.segment_id,
      video_id: segment.youtube_video_id,
    });
  };

  return (
    <article className="segment-card">
      <div className="segment-card__header">
        <p className="timestamp">
          {segment.timestamp_label} · {segment.review_status.replace("_", " ")}
        </p>
        <h2>{segment.segment_title}</h2>
        <p className="meta-line">{segment.video_title}</p>
      </div>

      <div className="segment-tags" aria-label="Technique tags">
        {segment.tags.map((tag) => (
          <a key={tag.slug} href={`/library/tags/${tag.slug}`} aria-current={tag.is_primary ? "true" : undefined}>
            {tag.label}
          </a>
        ))}
      </div>

      <dl className="segment-copy">
        <div>
          <dt>Use when</dt>
          <dd>{segment.use_when}</dd>
        </div>
        <div>
          <dt>Teaching summary</dt>
          <dd>{segment.teaching_summary}</dd>
        </div>
      </dl>

      {segment.contextual_clues.length > 0 ? (
        <aside className="transcript-context" aria-label="Transcript context">
          <p>Transcript context</p>
          <ul>
            {segment.contextual_clues.slice(0, 2).map((clue) => (
              <li key={clue}>{clue}</li>
            ))}
          </ul>
        </aside>
      ) : null}

      {isWatching ? (
        <div className="segment-player">
          <div className="clip-label">
            <span className="clip-label__timestamp">{segment.timestamp_label}</span>
            <span className="clip-label__title">{segment.segment_title}</span>
          </div>
          <YouTubeSegmentEmbed
            videoId={segment.youtube_video_id}
            startSeconds={segment.start_seconds}
            title={segment.segment_title}
          />
        </div>
      ) : null}

      <div className="segment-actions">
        <button
          className="btn"
          type="button"
          onClick={() => {
            if (!isWatching) trackVideoStart();
            setIsWatching((value) => !value);
          }}
        >
          {isWatching ? "Hide segment" : "Watch segment"}
        </button>
        <a
          className="btn secondary"
          href={getYouTubeWatchUrl(segment.youtube_video_id, segment.start_seconds)}
          target="_blank"
          rel="noopener"
          onClick={trackVideoStart}
        >
          Open full video
        </a>
      </div>
    </article>
  );
}

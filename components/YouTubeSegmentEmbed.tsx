import { getYouTubeEmbedUrl } from "@/lib/youtube";

export function YouTubeSegmentEmbed({
  videoId,
  startSeconds,
  title,
}: {
  videoId: string;
  startSeconds: number;
  title: string;
}) {
  return (
    <div className="video">
      <iframe
        src={getYouTubeEmbedUrl(videoId, startSeconds)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

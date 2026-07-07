export function getYouTubeWatchUrl(videoId: string, startSeconds: number) {
  return `https://www.youtube.com/watch?v=${videoId}&t=${startSeconds}s`;
}

export function getYouTubeEmbedUrl(videoId: string, startSeconds: number) {
  return `https://www.youtube.com/embed/${videoId}?start=${startSeconds}`;
}

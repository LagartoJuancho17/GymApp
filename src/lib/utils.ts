export function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function getEmbedUrl(url?: string): string | null {
  if (!url) return null;
  let videoId = '';
  try {
    if (url.includes('/shorts/')) {
      videoId = url.split('/shorts/')[1].split('?')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }
  } catch (e) {
    return null;
  }
  return url; // fallback
}

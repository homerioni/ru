/**
 * Normalizes admin input (URL, embed link, or iframe HTML) into an iframe src.
 */
export function parseStreamInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch?.[1]) return iframeMatch[1];

  const srcMatch = trimmed.match(/^src=["']([^"']+)["']$/i);
  if (srcMatch?.[1]) return srcMatch[1];

  const youtubeWatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/
  );
  if (youtubeWatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeWatch[1]}`;
  }

  const youtubeEmbed = trimmed.match(/youtube\.com\/embed\/([\w-]{6,})/);
  if (youtubeEmbed?.[1]) {
    return `https://www.youtube.com/embed/${youtubeEmbed[1]}`;
  }

  const rutubeWatch = trimmed.match(/rutube\.ru\/video\/([\w-]+)/);
  if (rutubeWatch?.[1]) {
    return `https://rutube.ru/play/embed/${rutubeWatch[1]}`;
  }

  const rutubeEmbed = trimmed.match(/rutube\.ru\/play\/embed\/([\w-]+)/);
  if (rutubeEmbed?.[1]) {
    return `https://rutube.ru/play/embed/${rutubeEmbed[1]}`;
  }

  const vkVideo = trimmed.match(
    /vk\.com\/video(-?\d+)_(\d+)/
  );
  if (vkVideo?.[1] && vkVideo?.[2]) {
    return `https://vk.com/video_ext.php?oid=${vkVideo[1]}&id=${vkVideo[2]}&hd=1`;
  }

  const twitchChannel = trimmed.match(/twitch\.tv\/([\w]+)$/);
  if (twitchChannel?.[1] && !['videos', 'directory'].includes(twitchChannel[1])) {
    const host =
      typeof window !== 'undefined' ? window.location.hostname : 'rechutd.ru';
    return `https://player.twitch.tv/?channel=${twitchChannel[1]}&parent=${host}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

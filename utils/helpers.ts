// Enhanced with design token references
/**
 * Format milliseconds to mm:ss or hh:mm:ss string.
 */
export function formatTime(ms: number): string {
  if (!ms || isNaN(ms) || ms < 0) return '0:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(hours > 0 ? 2 : 1, '0');
  const ss = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Extract the file name from a URI or path.
 */
export function getFilename(uri: string): string {
  if (!uri) return 'Unknown file';
  const parts = uri.split('/');
  const last = parts[parts.length - 1];
  // Decode URI encoding
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Supported audio MIME types / extensions.
 */
export const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/flac',
  'audio/x-flac',
  'audio/*',
];

/**
 * Playback speed options.
 */
export const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

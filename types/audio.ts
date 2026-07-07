/**
 * TypeScript definitions for audio playback and controls.
 */
/**
 * Represents an active or queued audio track.
 */
export interface AudioTrack {
  id: string;
  uri: string;
  title: string;
  durationMs: number;
  artist?: string;
}

export type PlaybackRate = 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

export interface SleepTimerConfig {
  durationMinutes: number;
  remainingMs: number;
  isActive: boolean;
}

export interface SeekGestureState {
  isSeeking: boolean;
  seekPositionMs: number;
  percentage: number;
}

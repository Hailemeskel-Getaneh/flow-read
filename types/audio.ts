/**
 * TypeScript definitions for audio playback and controls.
 */
export interface AudioTrack {
  id: string;
  uri: string;
  title: string;
  durationMs: number;
  artist?: string;
}

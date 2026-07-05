import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

export interface AudioState {
  isLoaded: boolean;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  rate: number;
  error: string | null;
  filename: string | null;
  sleepTimerMs: number | null; // null = no timer, number = ms remaining
}

export interface AudioControls {
  loadAudio: (uri: string, filename: string) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seekTo: (positionMs: number) => Promise<void>;
  skipBackward: (seconds?: number) => Promise<void>;
  skipForward: (seconds?: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  setSleepTimer: (minutes: number | null) => void;
  unload: () => Promise<void>;
}

const INITIAL_STATE: AudioState = {
  isLoaded: false,
  isPlaying: false,
  positionMs: 0,
  durationMs: 0,
  rate: 1.0,
  error: null,
  filename: null,
  sleepTimerMs: null,
};

export function useAudioPlayer() {
  return INITIAL_STATE;
}

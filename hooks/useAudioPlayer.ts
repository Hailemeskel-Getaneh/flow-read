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

export function useAudioPlayer(): AudioState & AudioControls {
  const [state, setState] = useState<AudioState>(INITIAL_STATE);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isUnmountedRef = useRef(false);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Safe state updater (won't update after unmount)
  const safeSetState = useCallback((updater: (prev: AudioState) => AudioState) => {
    if (!isUnmountedRef.current) {
      setState(updater);
    }
  }, []);

  useEffect(() => {
    // Configure audio mode on mount
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
      } catch (err) {
        console.warn('[useAudioPlayer] Could not set audio mode:', err);
      }
    };

    configureAudio();

    return () => {
      isUnmountedRef.current = true;
      // Clear sleep timer
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
      // Cleanup sound on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
  return { ...state } as any;
}

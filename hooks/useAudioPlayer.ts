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
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback(
    (status: any) => {
      if (!status.isLoaded) {
        if (status.error) {
          safeSetState((prev) => ({
            ...prev,
            error: `Playback error: ${status.error}`,
            isPlaying: false,
          }));
        }
        return;
      }

      safeSetState((prev) => ({
        ...prev,
        isLoaded: true,
        isPlaying: status.isPlaying,
        positionMs: status.positionMillis ?? 0,
        durationMs: status.durationMillis ?? 0,
        rate: status.rate ?? 1.0,
        error: null,
      }));

      // Auto-reset when playback finishes
      if (status.didJustFinish) {
        safeSetState((prev) => ({ ...prev, isPlaying: false, positionMs: 0 }));
        // Cancel sleep timer on finish
        if (sleepTimerRef.current) {
          clearInterval(sleepTimerRef.current);
          sleepTimerRef.current = null;
          safeSetState((prev) => ({ ...prev, sleepTimerMs: null }));
        }
      }
    },
    [safeSetState],
  );

  const loadAudio = useCallback(
    async (uri: string, filename: string) => {
      safeSetState((prev) => ({
        ...prev,
        error: null,
        isLoaded: false,
        filename,
      }));

      try {
        // Unload previous sound
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri },
          {
            shouldPlay: false,
            rate: state.rate,
            isMuted: false,
            volume: 1.0,
            isLooping: false,
          },
          onPlaybackStatusUpdate,
        );

        soundRef.current = sound;
        safeSetState((prev) => ({ ...prev, isLoaded: true, filename }));
      } catch (err: any) {
        safeSetState((prev) => ({
          ...prev,
          error: err?.message ?? 'Failed to load audio file',
          isLoaded: false,
        }));
      }
    },
    [onPlaybackStatusUpdate, safeSetState, state.rate],
  );

  const play = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.playAsync();
    } catch (err: any) {
      safeSetState((prev) => ({
        ...prev,
        error: err?.message ?? 'Failed to play audio',
      }));
    }
  }, [safeSetState]);

  const pause = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.pauseAsync();
    } catch (err: any) {
      safeSetState((prev) => ({
        ...prev,
        error: err?.message ?? 'Failed to pause audio',
      }));
    }
  }, [safeSetState]);

  const seekTo = useCallback(
    async (positionMs: number) => {
      if (!soundRef.current) return;
      try {
        await soundRef.current.setPositionAsync(positionMs);
      } catch (err: any) {
        safeSetState((prev) => ({
          ...prev,
          error: err?.message ?? 'Failed to seek',
        }));
      }
    },
    [safeSetState],
  );

  const skipBackward = useCallback(
    async (seconds: number = 15) => {
      const newPosition = Math.max(0, state.positionMs - seconds * 1000);
      await seekTo(newPosition);
    },
    [seekTo, state.positionMs],
  );

  const skipForward = useCallback(
    async (seconds: number = 15) => {
      const newPosition = Math.min(
        state.durationMs,
        state.positionMs + seconds * 1000,
      );
      await seekTo(newPosition);
    },
    [seekTo, state.positionMs, state.durationMs],
  );

  const setRate = useCallback(
    async (rate: number) => {
      if (!soundRef.current) {
        safeSetState((prev) => ({ ...prev, rate }));
        return;
      }
      try {
        // shouldCorrectPitch keeps pitch stable at different rates
        await soundRef.current.setRateAsync(rate, true);
        safeSetState((prev) => ({ ...prev, rate }));
      } catch (err: any) {
        safeSetState((prev) => ({
          ...prev,
          error: err?.message ?? 'Failed to change playback rate',
        }));
      }
    },
    [safeSetState],
  );

  const setSleepTimer = useCallback(
    (minutes: number | null) => {
      // Clear any existing timer
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }

      if (minutes === null) {
        safeSetState((prev) => ({ ...prev, sleepTimerMs: null }));
        return;
      }

      const totalMs = minutes * 60 * 1000;
      safeSetState((prev) => ({ ...prev, sleepTimerMs: totalMs }));

      const startTime = Date.now();
      sleepTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = totalMs - elapsed;

        if (remaining <= 0) {
          // Timer expired — pause audio
          if (sleepTimerRef.current) {
            clearInterval(sleepTimerRef.current);
            sleepTimerRef.current = null;
          }
          soundRef.current?.pauseAsync().catch(() => {});
          safeSetState((prev) => ({ ...prev, sleepTimerMs: null, isPlaying: false }));
        } else {
          safeSetState((prev) => ({ ...prev, sleepTimerMs: remaining }));
        }
      }, 1000);
    },
    [safeSetState],
  );

  const unload = useCallback(async () => {
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    safeSetState(() => ({ ...INITIAL_STATE }));
  }, [safeSetState]);

  return {
    ...state,
    loadAudio,
    play,
    pause,
    seekTo,
    skipBackward,
    skipForward,
    setRate,
    setSleepTimer,
    unload,
  };
}

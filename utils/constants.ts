/**
 * Global application constants.
 */
export const APP_CONFIG = {
  NAME: 'Flow Read',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.flowread.studyreader',
  DEFAULT_PLAYBACK_RATE: 1.0,
  DEFAULT_SKIP_SECONDS: 15,
  MAX_PAGE_JUMP_LIMIT: 9999,
  RECENT_FILES_MAX_COUNT: 10,
  AUTO_HIDE_CONTROLS_MS: 3000,
};

export const AUDIO_CONSTANTS = {
  TIMER_INTERVAL_MS: 1000,
  SCRUB_UPDATE_DEBOUNCE_MS: 50,
  MIN_SEEK_POSITION_MS: 0,
  DEFAULT_VOLUME: 1.0,
  PROGRESS_STRIP_HEIGHT: 3,
};

export const SLEEP_TIMER_PRESETS = [5, 10, 15, 30, 45, 60] as const;
export type SleepTimerMinutes = typeof SLEEP_TIMER_PRESETS[number];

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
  LayoutChangeEvent,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AudioState, AudioControls } from '../hooks/useAudioPlayer';
import { formatTime, truncate, SPEED_OPTIONS } from '../utils/helpers';

interface FloatingAudioPlayerProps {
  audio: AudioState & AudioControls;
  onPickAudio: () => void;
}

const SLEEP_TIMER_OPTIONS = [5, 10, 15, 30, 45, 60]; // minutes

export default function FloatingAudioPlayer({
  audio,
  onPickAudio,
}: FloatingAudioPlayerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [seekBarWidth, setSeekBarWidth] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);

  const progress =
    audio.durationMs > 0 ? audio.positionMs / audio.durationMs : 0;
  const displayPosition = isSeeking ? seekPosition : audio.positionMs;
  const displayProgress =
    audio.durationMs > 0 ? displayPosition / audio.durationMs : 0;

  // ----------- seek bar hit test -----------
  const onSeekBarLayout = useCallback((e: LayoutChangeEvent) => {
    setSeekBarWidth(e.nativeEvent.layout.width);
  }, []);

  const getSeekPositionFromEvent = useCallback(
    (e: GestureResponderEvent) => {
      const x = e.nativeEvent.locationX;
      const ratio = Math.min(Math.max(x / seekBarWidth, 0), 1);
      return ratio * audio.durationMs;
    },
    [seekBarWidth, audio.durationMs],
  );

  // PanResponder for seek bar
  const seekPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => audio.isLoaded,
    onMoveShouldSetPanResponder: () => audio.isLoaded,
    onPanResponderGrant: (e) => {
      setIsSeeking(true);
      setSeekPosition(getSeekPositionFromEvent(e));
    },
    onPanResponderMove: (e) => {
      setSeekPosition(getSeekPositionFromEvent(e));
    },
    onPanResponderRelease: async (e) => {
      const pos = getSeekPositionFromEvent(e);
      setIsSeeking(false);
      await audio.seekTo(pos);
    },
    onPanResponderTerminate: () => {
      setIsSeeking(false);
    },
  });

  const togglePlayPause = async () => {
    if (audio.isPlaying) {
      await audio.pause();
    } else {
      await audio.play();
    }
  };

  const handleSpeedSelect = async (rate: number) => {
    await audio.setRate(rate);
    setShowSpeedMenu(false);
  };

  const handleSleepTimer = (minutes: number | null) => {
    audio.setSleepTimer(minutes);
    setShowSleepModal(false);
  };

  const sleepTimerActive = audio.sleepTimerMs !== null;

  // Format sleep timer countdown
  const sleepTimerDisplay = audio.sleepTimerMs
    ? formatTime(audio.sleepTimerMs)
    : null;

  // ----------- Minimized view -----------
  if (isMinimized) {
    return (
      <View style={styles.minimizedContainer}>
        <TouchableOpacity
          style={styles.minimizedContent}
          onPress={() => setIsMinimized(false)}
          activeOpacity={0.9}
        >
          <View style={styles.minimizedLeft}>
            <Ionicons name="musical-notes" size={14} color="#a78bfa" />
            <Text style={styles.minimizedText} numberOfLines={1}>
              {audio.filename
                ? truncate(audio.filename, 22)
                : 'No audio'}
            </Text>
            {sleepTimerActive && sleepTimerDisplay && (
              <View style={styles.sleepBadge}>
                <Ionicons name="moon" size={10} color="#ec4899" />
                <Text style={styles.sleepBadgeText}>{sleepTimerDisplay}</Text>
              </View>
            )}
          </View>
          <View style={styles.minimizedRight}>
            {audio.isLoaded && (
              <TouchableOpacity
                onPress={togglePlayPause}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={audio.isPlaying ? 'pause' : 'play'}
                  size={18}
                  color="#e2e8f0"
                />
              </TouchableOpacity>
            )}
            <Ionicons name="chevron-up" size={16} color="#64748b" />
          </View>
        </TouchableOpacity>

        {/* Mini progress bar */}
        {audio.isLoaded && (
          <View style={styles.miniProgressBar}>
            <View
              style={[
                styles.miniProgressFill,
                { width: `${Math.min(progress * 100, 100)}%` as any },
              ]}
            />
          </View>
        )}
      </View>
    );
  }

  // ----------- Full player -----------
  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.fileInfo}>
          <View style={styles.audioIcon}>
            <Ionicons name="musical-notes" size={14} color="#a78bfa" />
          </View>
          <Text style={styles.filename} numberOfLines={1}>
            {audio.filename ? truncate(audio.filename, 26) : 'No audio selected'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {/* Sleep timer button */}
          <TouchableOpacity
            style={[styles.headerBtn, sleepTimerActive && styles.headerBtnActive]}
            onPress={() => setShowSleepModal(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="moon"
              size={16}
              color={sleepTimerActive ? '#ec4899' : '#94a3b8'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={onPickAudio}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="folder-open-outline" size={18} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setIsMinimized(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-down" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sleep timer countdown */}
      {sleepTimerActive && sleepTimerDisplay && (
        <View style={styles.sleepTimerRow}>
          <Ionicons name="moon" size={12} color="#ec4899" />
          <Text style={styles.sleepTimerText}>
            Auto-pause in {sleepTimerDisplay}
          </Text>
          <TouchableOpacity
            onPress={() => handleSleepTimer(null)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name="close-circle" size={14} color="#64748b" />
          </TouchableOpacity>
        </View>
      )}

      {/* Error message */}
      {audio.error && (
        <Text style={styles.errorText} numberOfLines={2}>
          ⚠ {audio.error}
        </Text>
      )}

      {/* Seek bar */}
      <View
        style={styles.seekBarContainer}
        onLayout={onSeekBarLayout}
        {...seekPanResponder.panHandlers}
      >
        <View style={styles.seekBarTrack}>
          <View
            style={[
              styles.seekBarFill,
              { width: `${Math.min(displayProgress * 100, 100)}%` as any },
            ]}
          />
          <View
            style={[
              styles.seekBarThumb,
              {
                left: `${Math.min(displayProgress * 100, 100)}%` as any,
              },
            ]}
          />
        </View>
      </View>

      {/* Time row */}
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(displayPosition)}</Text>
        <Text style={styles.timeText}>{formatTime(audio.durationMs)}</Text>
      </View>

      {/* Controls row */}
      <View style={styles.controlsRow}>
        {/* Speed button */}
        <View style={styles.speedContainer}>
          <TouchableOpacity
            style={styles.speedBtn}
            onPress={() => setShowSpeedMenu(!showSpeedMenu)}
          >
            <Text style={styles.speedBtnText}>{audio.rate}x</Text>
          </TouchableOpacity>

          {showSpeedMenu && (
            <View style={styles.speedMenu}>
              {SPEED_OPTIONS.map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[
                    styles.speedOption,
                    audio.rate === rate && styles.speedOptionActive,
                  ]}
                  onPress={() => handleSpeedSelect(rate)}
                >
                  <Text
                    style={[
                      styles.speedOptionText,
                      audio.rate === rate && styles.speedOptionTextActive,
                    ]}
                  >
                    {rate}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Skip back */}
        <TouchableOpacity
          style={[styles.controlBtn, !audio.isLoaded && styles.controlBtnDisabled]}
          onPress={() => audio.skipBackward(15)}
          disabled={!audio.isLoaded}
        >
          <Ionicons name="play-back" size={22} color={audio.isLoaded ? '#cbd5e1' : '#334155'} />
          <Text style={[styles.skipLabel, !audio.isLoaded && styles.skipLabelDisabled]}>15</Text>
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity
          style={[styles.playBtn, !audio.isLoaded && styles.playBtnDisabled]}
          onPress={togglePlayPause}
          disabled={!audio.isLoaded}
          activeOpacity={0.8}
        >
          {!audio.isLoaded && audio.filename ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name={audio.isPlaying ? 'pause' : 'play'}
              size={26}
              color="#fff"
            />
          )}
        </TouchableOpacity>

        {/* Skip forward */}
        <TouchableOpacity
          style={[styles.controlBtn, !audio.isLoaded && styles.controlBtnDisabled]}
          onPress={() => audio.skipForward(15)}
          disabled={!audio.isLoaded}
        >
          <Ionicons name="play-forward" size={22} color={audio.isLoaded ? '#cbd5e1' : '#334155'} />
          <Text style={[styles.skipLabel, !audio.isLoaded && styles.skipLabelDisabled]}>15</Text>
        </TouchableOpacity>

        {/* Spacer to balance speed button */}
        <View style={styles.speedPlaceholder} />
      </View>

      {/* Sleep Timer Modal */}
      <Modal
        visible={showSleepModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSleepModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowSleepModal(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Ionicons name="moon" size={20} color="#ec4899" />
              <Text style={styles.modalTitle}>Sleep Timer</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Auto-pause audio after a set time
            </Text>

            <View style={styles.timerGrid}>
              {SLEEP_TIMER_OPTIONS.map((min) => (
                <TouchableOpacity
                  key={min}
                  style={[
                    styles.timerOption,
                    audio.sleepTimerMs !== null &&
                      Math.abs(audio.sleepTimerMs - min * 60 * 1000) < 60000 &&
                      styles.timerOptionActive,
                  ]}
                  onPress={() => handleSleepTimer(min)}
                >
                  <Text style={styles.timerOptionValue}>{min}</Text>
                  <Text style={styles.timerOptionUnit}>min</Text>
                </TouchableOpacity>
              ))}
            </View>

            {sleepTimerActive && (
              <TouchableOpacity
                style={styles.cancelTimerBtn}
                onPress={() => handleSleepTimer(null)}
              >
                <Ionicons name="close-circle-outline" size={18} color="#f87171" />
                <Text style={styles.cancelTimerText}>Cancel Timer</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowSleepModal(false)}
            >
              <Text style={styles.modalCloseText}>Dismiss</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0f',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    marginRight: 8,
  },
  audioIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#a78bfa22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filename: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  headerBtn: {
    padding: 4,
    borderRadius: 8,
  },
  headerBtnActive: {
    backgroundColor: '#ec489920',
  },
  sleepTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ec489912',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ec489920',
  },
  sleepTimerText: {
    flex: 1,
    fontSize: 11,
    color: '#ec4899',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 11,
    color: '#f87171',
    marginBottom: 8,
    backgroundColor: '#f8717118',
    borderRadius: 6,
    padding: 6,
  },
  seekBarContainer: {
    paddingVertical: 10,
    marginHorizontal: -4,
  },
  seekBarTrack: {
    height: 4,
    backgroundColor: '#2d2d4e',
    borderRadius: 2,
    position: 'relative',
    overflow: 'visible',
  },
  seekBarFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
  },
  seekBarThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#a78bfa',
    marginLeft: -8,
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 11,
    color: '#475569',
    fontVariant: ['tabular-nums'],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  speedContainer: {
    position: 'relative',
    zIndex: 10,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff0a',
  },
  timerOptionActive: {
    backgroundColor: '#ec489920',
    borderColor: '#ec489950',
  },
  timerOptionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  timerOptionUnit: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  cancelTimerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8717115',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f8717130',
  },
  cancelTimerText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '600',
  },
  modalClose: {
    alignItems: 'center',
    padding: 12,
  },
  modalCloseText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '500',
  },
});
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
  },
  speedBtn: {
    backgroundColor: '#2d2d4e',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 44,
    alignItems: 'center',
  },
  speedBtnText: {
    fontSize: 12,
    color: '#a78bfa',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  speedMenu: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    backgroundColor: '#2d2d4e',
    borderRadius: 10,
    overflow: 'hidden',
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  speedOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  speedOptionActive: {
    backgroundColor: '#6366f140',
  },
  speedOptionText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
  },
  speedOptionTextActive: {
    color: '#a78bfa',
    fontWeight: '700',
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    position: 'relative',
  },
  controlBtnDisabled: {
    opacity: 0.4,
  },
  skipLabel: {
    position: 'absolute',
    bottom: 2,
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: '700',
  },
  skipLabelDisabled: {
    color: '#334155',
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  playBtnDisabled: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
    elevation: 0,
  },
  speedPlaceholder: {
    width: 44,
  },
  // Minimized styles
  minimizedContainer: {
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0f',
  },
  minimizedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  minimizedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  minimizedText: {
    fontSize: 12,
    color: '#94a3b8',
    flex: 1,
  },
  minimizedRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sleepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ec489920',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sleepBadgeText: {
    fontSize: 10,
    color: '#ec4899',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  miniProgressBar: {
    height: 2,
    backgroundColor: '#2d2d4e',
    marginHorizontal: 0,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#8b5cf680',
  },
  // Sleep timer modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'android' ? 32 : 24,
    borderTopWidth: 1,
    borderColor: '#ffffff10',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 20,
  },
  timerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  timerOption: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: '#12122280',
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

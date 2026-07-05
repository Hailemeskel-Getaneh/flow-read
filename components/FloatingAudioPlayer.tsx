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
  return <View style={styles.container} />;
}
const styles = StyleSheet.create({ container: { padding: 16 } });

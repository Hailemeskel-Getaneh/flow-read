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
  return <View style={styles.container}><View style={styles.seekRow} /></View>;
}
const styles = StyleSheet.create({ container: { padding: 16 }, seekRow: { height: 20 } });

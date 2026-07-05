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
  return <View style={styles.container}><Text>Player</Text></View>;
}
const styles = StyleSheet.create({ container: { padding: 16 } });

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import FloatingAudioPlayer from '../components/FloatingAudioPlayer';
import PdfViewer from '../components/PdfViewer';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { getFilename, AUDIO_MIME_TYPES } from '../utils/helpers';

export default function ReaderScreen() {
  const router = useRouter();
  const audio = useAudioPlayer();

  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string | null>(null);
  const [showPickerModal, setShowPickerModal] = useState(false);

  // ---- File pickers ----

  const pickPdf = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      setPdfUri(asset.uri);
      setPdfFilename(asset.name ?? getFilename(asset.uri));
    } catch (err: any) {
      console.warn('[ReaderScreen] pickPdf error:', err);
    }
  }, []);

  const pickAudio = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: AUDIO_MIME_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      const filename = asset.name ?? getFilename(asset.uri);
      await audio.loadAudio(asset.uri, filename);
    } catch (err: any) {
      console.warn('[ReaderScreen] pickAudio error:', err);
    }
  }, [audio]);

  const handleOpenModal = useCallback(() => {
    setShowPickerModal(true);
  }, []);

  const handleModalPdf = useCallback(async () => {
    setShowPickerModal(false);
    await pickPdf();
  }, [pickPdf]);

  const handleModalAudio = useCallback(async () => {
    setShowPickerModal(false);
    await pickAudio();
  }, [pickAudio]);

  const handleModalBoth = useCallback(async () => {
    setShowPickerModal(false);
    await pickPdf();
    await pickAudio();
  }, [pickPdf, pickAudio]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ---- Top navigation bar ---- */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#94a3b8" />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {pdfFilename ?? 'Study Reader'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.openBtn}
          onPress={handleOpenModal}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.openBtnText}>Open</Text>
  return <SafeAreaView style={styles.container}><Text>Picker ready</Text></SafeAreaView>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#0f0f1a' } });

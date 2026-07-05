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

  return <SafeAreaView style={styles.container}><Text>Reader</Text></SafeAreaView>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#0f0f1a' } });

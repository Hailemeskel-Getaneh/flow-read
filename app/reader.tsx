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
        </TouchableOpacity>
      </View>

      {/* ---- Floating Audio Player ---- */}
      <FloatingAudioPlayer audio={audio} onPickAudio={pickAudio} />

      {/* ---- PDF Viewer (takes all remaining space) ---- */}
      <View style={styles.pdfArea}>
        <PdfViewer uri={pdfUri} onPickPdf={pickPdf} />
      </View>

      {/* ---- File picker modal ---- */}
      <Modal
        visible={showPickerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPickerModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowPickerModal(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Open a file</Text>
            <Text style={styles.modalSubtitle}>
              Choose what you want to open
            </Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleModalPdf}
              activeOpacity={0.85}
            >
              <View style={[styles.modalOptionIcon, { backgroundColor: '#6366f122' }]}>
                <Ionicons name="document-text" size={24} color="#6366f1" />
              </View>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>PDF Document</Text>
                <Text style={styles.modalOptionDesc}>
                  Open a PDF file to read
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleModalAudio}
              activeOpacity={0.85}
            >
              <View style={[styles.modalOptionIcon, { backgroundColor: '#8b5cf622' }]}>
                <Ionicons name="musical-notes" size={24} color="#8b5cf6" />
              </View>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Audio File</Text>
                <Text style={styles.modalOptionDesc}>
                  Open an audio file to listen to
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalOptionHighlight]}
              onPress={handleModalBoth}
              activeOpacity={0.85}
            >
              <View style={[styles.modalOptionIcon, { backgroundColor: '#a78bfa22' }]}>
                <Ionicons name="layers" size={24} color="#a78bfa" />
              </View>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Open Both</Text>
                <Text style={styles.modalOptionDesc}>
                  Select PDF then audio in one go
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowPickerModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0a',
    backgroundColor: '#0f0f1a',
    gap: 8,
  },
  backBtn: {
    padding: 6,
    borderRadius: 10,
  },
  topBarCenter: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  openBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pdfArea: {
    flex: 1,
  },
  // Modal
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
    paddingBottom: Platform.OS === 'android' ? 36 : 28,
    borderTopWidth: 1,
    borderColor: '#ffffff10',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12122280',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  modalOptionHighlight: {
    borderColor: '#a78bfa20',
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 2,
  },
  modalOptionDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  modalCancel: {
    marginTop: 8,
    alignItems: 'center',
    padding: 14,
  },
  modalCancelText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '500',
  },
});

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PdfViewerProps {
  uri: string | null;
  onPickPdf: () => void;
  onPageChange?: (page: number, total: number) => void;
}

export default function PdfViewer({ uri, onPickPdf, onPageChange }: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPageJump, setShowPageJump] = useState(false);
  const [jumpInput, setJumpInput] = useState('');

  // Fade-in on load
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pdfRef = useRef<any>(null);

  const handleLoadComplete = useCallback(
    (numberOfPages: number) => {
      setTotalPages(numberOfPages);
      setCurrentPage(1);
      setIsLoading(false);
      setError(null);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    },
    [fadeAnim],
  );

  const handlePageChanged = useCallback(
    (page: number, numberOfPages: number) => {
      setCurrentPage(page);
      setTotalPages(numberOfPages);
      onPageChange?.(page, numberOfPages);
    },
    [onPageChange],
  );

  const handleError = useCallback((err: object) => {
    setIsLoading(false);
    const msg = (err as any)?.message ?? String(err);
    if (msg.includes('password')) {
      setError('This PDF is password-protected and cannot be opened.');
    } else if (msg.includes('corrupt') || msg.includes('invalid')) {
      setError('The PDF file appears to be corrupt or invalid.');
    } else {
      setError(`Failed to load PDF.\n${msg}`);
    }
  }, []);

  // Prevent link navigation
  const handlePressLink = useCallback((_uri: string) => {}, []);

  // Page jump
  const handleJumpToPage = useCallback(() => {
    const page = parseInt(jumpInput, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages && pdfRef.current) {
      pdfRef.current.setPage(page);
    }
    setShowPageJump(false);
    setJumpInput('');
  }, [jumpInput, totalPages]);

  // ---- Empty state ----
  if (!uri) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <Ionicons name="document-text-outline" size={56} color="#334155" />
        </View>
        <Text style={styles.emptyTitle}>No PDF selected</Text>
        <Text style={styles.emptySubtitle}>
          Tap the button below to open a PDF document
        </Text>
        <TouchableOpacity style={styles.pickBtn} onPress={onPickPdf} activeOpacity={0.85}>
          <Ionicons name="folder-open-outline" size={20} color="#fff" />
          <Text style={styles.pickBtnText}>Select PDF</Text>
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <TipRow icon="musical-notes" text="Load audio from the player above" />
          <TipRow icon="moon" text="Set a sleep timer to auto-pause" />
          <TipRow icon="repeat" text="Skip 15 seconds back or forward" />
        </View>
      </View>
    );
  }
  return <View style={styles.container}><ActivityIndicator /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1 } });

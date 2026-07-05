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
  return <View style={styles.container}><Text>PdfViewer</Text></View>;
}
const styles = StyleSheet.create({ container: { flex: 1 } });

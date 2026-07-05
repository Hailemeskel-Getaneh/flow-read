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

  // ---- Error state ----
  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconBox, styles.errorIconBox]}>
          <Ionicons name="alert-circle-outline" size={56} color="#f87171" />
        </View>
        <Text style={[styles.emptyTitle, styles.errorTitle]}>Failed to load PDF</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.pickBtn} onPress={onPickPdf} activeOpacity={0.85}>
          <Ionicons name="folder-open-outline" size={20} color="#fff" />
          <Text style={styles.pickBtnText}>Select Another PDF</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* PDF renderer */}
      <Animated.View style={[styles.pdfWrapper, { opacity: fadeAnim }]}>
        <Pdf
          ref={pdfRef}
          key={uri} // remount when URI changes
          source={{ uri, cache: true }}
          style={styles.pdf}
          enablePaging={false}
          horizontal={false}
          fitPolicy={0} // fit width
          trustAllCerts={false}
          onLoadComplete={handleLoadComplete}
          onPageChanged={handlePageChanged}
          onError={handleError}
          onPressLink={handlePressLink}
          renderActivityIndicator={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.loadingText}>Loading PDF…</Text>
            </View>
          )}
        />
      </Animated.View>

      {/* Loading overlay (while fading in) */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading PDF…</Text>
        </View>
      )}

      {/* Page indicator — tap to jump */}
      {totalPages > 0 && (
        <TouchableOpacity
          style={styles.pageIndicator}
          onPress={() => {
            setJumpInput(String(currentPage));
            setShowPageJump(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="book-outline" size={11} color="#64748b" style={{ marginRight: 4 }} />
          <Text style={styles.pageIndicatorText}>
            {currentPage} / {totalPages}
          </Text>
        </TouchableOpacity>
      )}

      {/* Change PDF FAB */}
      <TouchableOpacity
        style={styles.changePdfBtn}
        onPress={onPickPdf}
        activeOpacity={0.85}
      >
        <Ionicons name="document-text-outline" size={16} color="#a78bfa" />
        <Text style={styles.changePdfText}>Change PDF</Text>
      </TouchableOpacity>

      {/* Page jump overlay */}
      {showPageJump && (
        <KeyboardAvoidingView
          style={styles.jumpOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.jumpBackdrop}
            activeOpacity={1}
            onPress={() => {
              setShowPageJump(false);
              setJumpInput('');
            }}
          />
          <View style={styles.jumpCard}>
            <Text style={styles.jumpTitle}>Go to page</Text>
            <Text style={styles.jumpSubtitle}>Enter a page number (1 – {totalPages})</Text>
            <TextInput
              style={styles.jumpInput}
              value={jumpInput}
              onChangeText={setJumpInput}
              keyboardType="number-pad"
              placeholder={String(currentPage)}
              placeholderTextColor="#334155"
              autoFocus
              onSubmitEditing={handleJumpToPage}
              returnKeyType="go"
              maxLength={6}
            />
            <View style={styles.jumpActions}>
              <TouchableOpacity
                style={styles.jumpCancelBtn}
                onPress={() => {
                  setShowPageJump(false);
                  setJumpInput('');
                }}
              >
                <Text style={styles.jumpCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.jumpGoBtn}
                onPress={handleJumpToPage}
                activeOpacity={0.85}
              >
                <Text style={styles.jumpGoText}>Go</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

// Small helper tip row for empty state
function TipRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.tipRow}>
      <View style={styles.tipIcon}>
        <Ionicons name={icon} size={13} color="#6366f1" />
      </View>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  pdfWrapper: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: '#0f0f1a',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
    gap: 12,
    zIndex: 5,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 14,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 58,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e35cc',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  pageIndicatorText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  changePdfBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1e1e35ee',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#a78bfa30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  changePdfText: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '600',
  },
  // Empty / error states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
    backgroundColor: '#0f0f1a',
  },
  emptyIconBox: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#1e1e35',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff0a',
    marginBottom: 4,
  },
  errorIconBox: {
    backgroundColor: '#f871711a',
    borderColor: '#f8717130',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'center',
  },
  errorTitle: {
    color: '#f87171',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorMessage: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  pickBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  tipsContainer: {
    marginTop: 24,
    gap: 8,
    width: '100%',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
  },
  tipIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#6366f115',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  // Page jump overlay
  jumpOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  jumpBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000066',
  },
  jumpCard: {
    backgroundColor: '#1e1e35',
    borderRadius: 20,
    padding: 24,
    width: '78%',
    borderWidth: 1,
    borderColor: '#ffffff10',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
    zIndex: 21,
  },
  jumpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  jumpSubtitle: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 16,
  },
  jumpInput: {
    backgroundColor: '#12121f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366f140',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 22,
    fontWeight: '700',
    color: '#f1f5f9',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    marginBottom: 16,
  },
  jumpActions: {
    flexDirection: 'row',
    gap: 10,
  },
  jumpCancelBtn: {
    flex: 1,
    backgroundColor: '#12121f',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  jumpCancelText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
  jumpGoBtn: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  jumpGoText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

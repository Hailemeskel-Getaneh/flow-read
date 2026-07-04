import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Flow Read</Text>
        <Text style={styles.subtitle}>Study Reader</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/reader')}>
          <Text style={styles.btnText}>Open Reader</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#f8fafc' },
  subtitle: { fontSize: 16, color: '#94a3b8', marginTop: 8 },
  btn: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 28, backgroundColor: '#6366f1', borderRadius: 12 },
  btnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
});

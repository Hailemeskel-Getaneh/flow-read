import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  // Animated values for entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push('/reader');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        {/* Decorative orbs */}
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        <View style={[styles.orb, styles.orb3]} />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#6366f140', '#8b5cf640']}
                style={styles.logoIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="book" size={32} color="#a78bfa" />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>Flow Read</Text>
            <Text style={styles.tagline}>Read & Listen. Simultaneously.</Text>
          </View>

          {/* Feature cards */}
          <View style={styles.featuresContainer}>
            <FeatureCard
              icon="document-text"
              title="PDF Reader"
              description="Open any PDF document with smooth scrolling and page navigation"
              color="#6366f1"
            />
            <FeatureCard
              icon="musical-notes"
              title="Audio Player"
              description="Play lectures, podcasts, or notes while reading"
              color="#8b5cf6"
            />
            <FeatureCard
              icon="sync"
              title="Synchronized"
              description="Audio keeps playing as you scroll — never lose your place"
              color="#a78bfa"
            />
            <FeatureCard
              icon="bookmark"
              title="Sleep Timer"
              description="Auto-stop audio after a set time so you don't miss anything"
              color="#ec4899"
            />
          </View>

          {/* CTA button */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleGetStarted}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
        <Text style={styles.title}>Study Reader</Text>
      </Animated.View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#0f0f1a' }, content: { flex: 1, padding: 24 } });

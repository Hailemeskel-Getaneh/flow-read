// Uses design tokens
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
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="arrow-forward" size={20} color="#fff" />
                <Text style={styles.ctaText}>Open Study Reader</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.ctaHint}>Select a PDF and audio file to get started</Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  background: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: '#6366f1',
    top: -100,
    right: -100,
  },
  orb2: {
    width: 220,
    height: 220,
    backgroundColor: '#8b5cf6',
    bottom: 80,
    left: -80,
  },
  orb3: {
    width: 160,
    height: 160,
    backgroundColor: '#a78bfa',
    top: height * 0.38,
    right: -40,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 60 : 40,
    paddingBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoIcon: {
    width: 76,
    height: 76,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#6366f140',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  featuresContainer: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e35',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffffff08',
    gap: 14,
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
  },
  ctaContainer: {
    paddingBottom: Platform.OS === 'android' ? 32 : 20,
    alignItems: 'center',
    gap: 12,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ctaHint: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
  },
});

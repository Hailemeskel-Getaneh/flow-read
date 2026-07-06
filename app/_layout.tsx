// Adopts theme tokens
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f0f1a' },
          headerTintColor: '#e2e8f0',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0f0f1a' },
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'Study Reader', headerShown: false }}
        />
        <Stack.Screen
          name="reader"
          options={{ title: 'Study Reader', headerShown: false }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

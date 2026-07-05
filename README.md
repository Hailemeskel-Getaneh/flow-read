# Flow Read — Study Reader 📖🎧

A premium **React Native / Expo** app that lets you read PDFs and listen to audio **simultaneously**. Built for students, researchers, and lifelong learners.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **PDF Reader** | Smooth scrolling PDF with `react-native-pdf` |
| 🎵 **Audio Player** | Full-featured player with seek bar, skip ±15 s, playback speed |
| 🌙 **Sleep Timer** | Auto-pause audio after 5, 10, 15, 30, 45, or 60 minutes |
| ⚡ **Playback Speed** | 0.75×, 1×, 1.25×, 1.5×, 2× with pitch correction |
| 📑 **Page Jump** | Tap the page counter to jump to any page instantly |
| 🗜️ **Minimizable Player** | Collapse audio player to a slim bar; mini progress strip shows while minimised |
| 🎨 **Dark UI** | Deep navy/violet colour scheme, glassmorphism cards, gradient accents |
| 🔁 **Open Both** | Pick PDF + audio in one flow |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`) or `npx expo`
- Android device / emulator **or** iOS device / simulator

> ⚠️ `react-native-pdf` and `react-native-blob-util` are **native modules** — they require a **development build** (not Expo Go).

### Install

```bash
npm install --legacy-peer-deps
```

### Run (development build required)

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

### Metro bundler only (Expo Go — PDF won't work)

```bash
npm start
```

---

## 📁 Project Structure

```
flow-read/
├── app/
│   ├── _layout.tsx          # Root navigator (Stack)
│   ├── index.tsx            # Home / landing screen
│   └── reader.tsx           # Main reader screen
├── components/
│   ├── FloatingAudioPlayer.tsx  # Audio player with sleep timer
│   └── PdfViewer.tsx            # PDF renderer with page jump
├── hooks/
│   └── useAudioPlayer.ts    # expo-av audio state + controls
├── utils/
│   └── helpers.ts           # formatTime, truncate, MIME types, etc.
└── assets/
    └── images/              # App icons & splash
```

---

## 🛠 Tech Stack

- **Expo ~52** (managed + native modules)
- **expo-router** — file-based navigation
- **expo-av** — audio playback
- **expo-document-picker** — file selection
- **expo-linear-gradient** — gradient UI elements
- **react-native-pdf** + **react-native-blob-util** — PDF rendering
- **@expo/vector-icons** (Ionicons)

---

## 📝 Notes

- Android requires a **development build** (`npx expo run:android`) because `react-native-pdf` is a native module.
- The app requests `READ_EXTERNAL_STORAGE` / `MANAGE_EXTERNAL_STORAGE` on Android for file access.
- Audio continues playing when the screen is locked (`staysActiveInBackground: true`).

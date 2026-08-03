# 🌐 Language Translation Tool

An intelligent, clean, and responsive full-stack **Language Translation Tool** built using **React, TypeScript, Node.js, Express, Tailwind CSS**, and **Server-Side AI Language Processing**.

---

## 📌 Project Overview

This project is a modern, real-time multi-language translation platform designed to translate text, speech, images (OCR), and documents seamlessly between 100+ global languages. It features automatic language detection, tone/formality controls, voice synthesis for native pronunciations, dual-voice conversation translation, and image/document text extraction.

The application combines a high-performance **Express API backend** with a **React single-page application** to provide instant translation feedback, offline fallbacks, and local storage state management for translation history and bookmarked favorites.

---

## 🛠️ What Are the Things We Used to Build It

### 1. Frontend Technologies
- **React 19**: Modern component-based UI library with hooks for state management and layout lifecycle.
- **TypeScript**: Statically typed JavaScript for robust error prevention and type-safe data structures across components.
- **Vite 6**: Fast frontend tooling and bundler providing high-speed module serving and production builds.
- **Tailwind CSS v4**: Utility-first CSS framework for custom layout styling, dark mode support, and clean visual design.
- **Motion (`motion/react`)**: High-performance animation engine for fluid route transitions, modal popovers, and interactive button feedback.
- **Lucide React**: Crisp vector icon set for interface controls and actions.

### 2. Backend & Server-Side APIs
- **Node.js & Express**: Event-driven web server hosting RESTful API endpoints for translation processing and file conversions.
- **Neural Language Translation Engine**: Server-side artificial intelligence model enforcing structured JSON responses for translation accuracy, language confidence scores, alternative phrasing, dictionary definitions, and grammatical notes.
- **Multimodal Vision & OCR Engine**: Server-side image parser for extracting text from images (PNG, JPEG) and translating visual contents.
- **Document Content Extractor**: Base64 file parser for translating full text documents (PDF, TXT) while preserving structural layout and paragraphs.

### 3. Browser Integration & Native Web APIs
- **Web Speech API**: Speech Recognition (`webkitSpeechRecognition`) for voice input recording and Speech Synthesis (`window.speechSynthesis`) for native audio pronunciations.
- **HTML5 Clipboard API**: Asynchronous one-click copying of source and translated text.
- **Local Storage API**: Browser-based client state persistence for saving user preferences, saved favorite translations, and recent history logs.

---

## ✨ Key Features

- 🌐 **Instant Multi-Language Translation**: Translate text between 100+ languages with automatic source language detection.
- 🕒 **Last 5 Translations History**: Live local state history card displaying the last 5 translations with one-click re-use and clear capabilities.
- 🎙️ **Voice Speech-to-Text & Text-to-Speech**: Voice recording for text input and native accent voice playback for pronunciations.
- 💬 **Dual-Voice Conversation Mode**: Turn-taking two-way dialogue translator for real-time bilingual conversations.
- 📷 **OCR Image Text Translation**: Upload or capture photos to extract and translate embedded text automatically.
- 📄 **Document Translation**: Parse and translate complete PDF, TXT, and document files.
- 📖 **Interactive Dictionary & Word Insights**: Search word definitions, parts of speech, phonetic pronunciations, and example usage sentences.
- 🌓 **Dark & Light Mode Support**: Theme selection with smooth transitions and persistent browser preferences.
- 📱 **Fully Responsive Layout**: Desktop-first and mobile-optimized design with clean navigation.

---

## 📁 Folder Structure

```
language-translation-tool/
│
├── server.ts                       # Node.js Express Server & REST API Proxy
├── package.json                    # Dependencies & NPM Scripts
├── tsconfig.json                   # TypeScript Compiler Settings
├── vite.config.ts                  # Vite Bundler & Server Setup
├── README.md                       # Documentation & Project Guide
│
├── src/
│   ├── main.tsx                    # React Root Entry Point
│   ├── App.tsx                     # Primary Application Shell & State Engine
│   ├── index.css                   # Tailwind CSS Global Imports & Styles
│   ├── types.ts                    # Shared TypeScript Types & Data Interfaces
│   │
│   ├── components/                 # Modular UI Components
│   │   ├── Header.tsx              # Main Navigation Header
│   │   ├── TranslationCard.tsx     # Core Translation Workspace Component
│   │   ├── HistorySection.tsx      # Last 5 Translations History Section
│   │   ├── RecentHistorySidebar.tsx# Collapsible History Drawer
│   │   ├── LanguageSelectorModal.tsx # Language Picker Modal
│   │   ├── QuickTools.tsx          # Utility Actions Grid
│   │   ├── BannerHero.tsx          # Informational Workspace Banner
│   │   └── Toast.tsx               # Toast Notification System
│   │
│   ├── views/                      # Application Screen Views
│   │   ├── TranslatorView.tsx      # Main Text Translator Workspace
│   │   ├── ConversationView.tsx    # Two-Way Voice Conversation Translator
│   │   ├── DocumentsView.tsx       # Document Parser & Translator
│   │   ├── OCRView.tsx             # Image Text Extraction & OCR View
│   │   ├── HistoryView.tsx         # Full Translation History Manager
│   │   ├── FavoritesView.tsx       # Bookmarked Favorite Translations
│   │   ├── SettingsView.tsx        # System Preferences & Settings
│   │   └── HelpView.tsx            # Documentation & User Guide
│   │
│   ├── data/
│   │   └── languages.ts            # Supported Languages Dataset & ISO Codes
│   │
│   └── utils/
│       ├── speech.ts               # Web Speech Synthesis & Recognition Logic
│       └── storage.ts              # LocalStorage Data Synchronization
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
Ensure you have **Node.js (v18 or higher)** and **npm** installed on your machine.

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/language-translation-tool.git
cd language-translation-tool
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the project root directory based on `.env.example`:
```env
PORT=3000
```

---

## 🚀 Running the Project

### Development Mode
Start the backend server and Vite development environment:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### Production Build
Compile the application for production:
```bash
npm run build
npm run start
```

---

## 📡 API Endpoint Reference

### 1. `POST /api/translate`
Executes text translation with language auto-detection, formality controls, and metadata generation.

**Request Body:**
```json
{
  "text": "Hello, welcome to our college campus!",
  "sourceLang": "auto",
  "targetLang": "es",
  "formality": "neutral",
  "style": "general"
}
```

**Sample Response:**
```json
{
  "translatedText": "¡Hola, bienvenido a nuestro campus universitario!",
  "detectedSourceLangName": "English",
  "detectedSourceLangCode": "en",
  "confidence": 0.99,
  "wordCount": 6,
  "sentenceCount": 1,
  "readingTimeSeconds": 2,
  "executionTimeMs": 320,
  "alternativeTranslations": [
    "¡Hola, te damos la bienvenida a nuestro campus universitario!"
  ],
  "dictionaryNotes": "Common welcoming phrase in Spanish."
}
```

---

### 2. `POST /api/detect`
Detects the source language of a given text snippet.

**Request Body:**
```json
{
  "text": "Bonjour tout le monde"
}
```

**Sample Response:**
```json
{
  "languageName": "French",
  "languageCode": "fr",
  "confidence": 0.98
}
```

---

### 3. `POST /api/ocr`
Extracts text from an uploaded base64 image and translates it into the target language.

**Request Body:**
```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "mimeType": "image/jpeg",
  "targetLang": "es"
}
```

**Sample Response:**
```json
{
  "extractedText": "Library Hours: 8 AM - 10 PM",
  "translatedText": "Horario de la biblioteca: 8 AM - 10 PM",
  "detectedLang": "English"
}
```

---

### 4. `POST /api/document`
Extracts and translates structured content from attached documents (PDF/TXT).

---

### 5. `POST /api/dictionary`
Fetches dictionary definitions, translations, parts of speech, and usage examples for a word.

---

## 📜 License
This project is open-source under the **MIT License**.

<img width="1912" height="831" alt="Screenshot 2026-07-30 202727" src="https://github.com/user-attachments/assets/b85bc514-5643-488a-9169-590a00af3e22" />

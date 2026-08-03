# 🎵 sound.ai — Deep Learning LSTM AI Music Generator

An end-to-end AI music generation platform and interactive web application built using **TypeScript**, **React**, **Tailwind CSS**, **Recharts**, and the **Web Audio API**. It features MIDI dataset preprocessing, sequence tokenization, interactive multi-layer LSTM model training analytics, temperature-based music generation, an interactive Piano Roll visualizer with polyphonic audio playback, and exportable Python codebases.

---

## 📌 Project Overview

**sound.ai** demonstrates how sequential deep learning models—specifically **Long Short-Term Memory (LSTM)** Recurrent Neural Networks—learn temporal dependencies, pitch structures, and harmonic progressions in musical note sequences. 

The application provides a complete machine learning workflow right in the browser:
1. **Dataset Explorer**: Ingests and inspects MIDI note sequences, track counts, key signatures, and tempo metadata.
2. **Preprocessing Engine**: Converts raw musical notes into fixed-length sliding windows ($N = 32$), builds a unique vocabulary dictionary, and encodes note sequences.
3. **LSTM Model Simulation**: Configures network hyperparameters (LSTM units, Dropout, Learning Rate, Batch Size) and simulates training epochs with live loss, accuracy, and perplexity metrics.
4. **AI Generation & Interactive Piano Roll**: Uses temperature-scaled Softmax sampling ($T \in [0.2, 1.5]$) to generate novel musical pieces, rendered on a high-performance interactive Piano Roll canvas with real-time Web Audio API synthesizer playback.

---

## ✨ Features

- 🎼 **MIDI Dataset Explorer**: Analyze note distributions, track count, duration, key signatures, and note frequency stats.
- ⚙️ **Configurable Preprocessor**: Custom sequence sliding window length, token dictionary mapping, one-hot vector representation, and target vector creation.
- 🧠 **Multi-Layer LSTM Network**: Interactive hyperparameter controls for 3-layer LSTM networks (256 $\rightarrow$ 256 $\rightarrow$ 128 units), Dropout regularization, Learning Rate, Batch Size, and Validation Split.
- 📊 **Real-time Training Analytics**: Live Recharts visualization tracking Cross-Entropy Loss, Validation Loss, Accuracy, and Perplexity across epochs with Early Stopping logic.
- 🎹 **Interactive Piano Roll & Audio Synth**: Custom canvas Piano Roll visualizer with color-coded note pitch blocks, synchronized playback cursor, and polyphonic Web Audio API audio synthesis.
- 🎛️ **Temperature Sampling Control**: Fine-tune musical creativity from conservative motifs ($T=0.2$) to experimental jazz progressions ($T=1.4$).
- 💾 **MIDI Binary Export**: Export generated AI musical pieces into standard `.mid` files using `midi-writer-js`.

---

## 📁 Folder Structure

```
sound-ai/
│
├── src/
│   ├── components/
│   │   ├── DatasetSection.tsx         # MIDI dataset parser & distribution charts
│   │   ├── PreprocessingSection.tsx   # Sequence extraction & vocabulary builder
│   │   ├── ModelSection.tsx           # LSTM neural network configuration & summary
│   │   ├── TrainingSection.tsx        # Interactive training loop & Recharts analytics
│   │   ├── GenerationSection.tsx      # AI music generation & history manager
│   │   └── PianoRoll.tsx              # Canvas piano roll visualizer & playback controller
│   │
│   ├── lib/
│   │   ├── lstmSimulator.ts           # Sequence preprocessing & LSTM step simulation
│   │   ├── midiEncoder.ts             # Standard MIDI binary file generator
│   │   └── synthAudio.ts              # Web Audio API polyphonic synthesizer engine
│   │
│   ├── data/
│   │   ├── sampleDataset.ts           # Initial classical MIDI dataset
│   │   └── pythonCodebase.ts          # Python PyTorch/TensorFlow export files
│   │
│   ├── assets/images/                 # Application screenshot mockups
│   ├── types.ts                       # Shared TypeScript interfaces
│   ├── App.tsx                        # Main application orchestrator
│   ├── main.tsx                       # React DOM entry point
│   └── index.css                      # Tailwind CSS stylesheet
│
├── index.html                         # Single-page app HTML template
├── package.json                       # Dependencies and build scripts
├── vite.config.ts                     # Vite configuration
└── README.md                          # Documentation & Theoretical Guide
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
Ensure you have **Node.js 18+** and **npm** installed on your system.

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/sound-ai.git
cd sound-ai
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

---

## 🧠 How the Deep Learning & LSTM System Works

### 1. Sequential Note Tokenization & Preprocessing
Musical notes and chords are extracted from MIDI tracks into discrete note strings (e.g., `"C4"`, `"E4.G4.B4"`).
A sliding window of length $S$ (default $32$) slides across the note array to form input sequence vectors $X$ and target next-note labels $y$:

$$X = [n_1, n_2, \dots, n_S], \quad y = n_{S+1}$$

---

### 2. Multi-Layer LSTM Architecture Equations
An LSTM cell addresses the vanishing gradient problem in long sequences by introducing a cell state $C_t$ controlled by three gates:

$$\text{Forget Gate: } f_t = \sigma(W_f \cdot [h_{t-1}, x_t] + b_f)$$

$$\text{Input Gate: } i_t = \sigma(W_i \cdot [h_{t-1}, x_t] + b_i)$$

$$\text{Candidate State: } \tilde{C}_t = \tanh(W_c \cdot [h_{t-1}, x_t] + b_c)$$

$$\text{Cell State Update: } C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t$$

$$\text{Output Gate: } o_t = \sigma(W_o \cdot [h_{t-1}, x_t] + b_o)$$

$$\text{Hidden State: } h_t = o_t \odot \tanh(C_t)$$

---

### 3. Temperature-Scaled Softmax Sampling
When generating music, logits $z$ from the final Dense layer are scaled by a temperature parameter $T$ before computing the Softmax probability distribution:

$$P(y_i) = \frac{\exp(z_i / T)}{\sum_{j=1}^{V} \exp(z_j / T)}$$

- **Low Temperature ($T \to 0.2$)**: Sharpened probabilities; produces highly structured, predictable, and conservative melodies.
- **High Temperature ($T \to 1.5$)**: Flattened probabilities; introduces randomness, syncopation, and creative dissonance.

---

## 📸 Screenshots & Visual Previews

### 1. MIDI Dataset & Preprocessing Explorer
![MIDI Dataset Preprocessor](./src/assets/images/sound_ai_dataset_1785425536420.jpg)

*Interactive dataset inspector displaying note frequency distributions, MIDI track metadata, sliding window tokenization, and sequence array vectors.*

---

### 2. LSTM Neural Network Architecture & Real-Time Training
![LSTM Training Analytics](./src/assets/images/sound_ai_training_1785425554690.jpg)

*Live model training simulation showing epoch progress, loss and accuracy learning curves via Recharts, parameter tuning, and learning rate adjustments.*

---

### 3. AI Music Generator & Interactive Piano Roll Player
![Piano Roll Generator](./src/assets/images/sound_ai_pianoroll_1785425569023.jpg)

*Interactive Piano Roll interface displaying generated note blocks, polyphonic Web Audio API synthesis controls, temperature slider, and MIDI download options.*

---

## 📜 License
This project is open-source under the MIT License.
<img width="1917" height="911" alt="Screenshot 2026-07-30 210800" src="https://github.com/user-attachments/assets/e50f9bfe-b08f-42e4-af8b-0d87edc6e4a0" />

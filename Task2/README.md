# 🎓 NLP-Based FAQ Chatbot Using Python & Flask

An intelligent, beginner-friendly College Assistant chatbot built using Python, Flask, NLTK, Scikit-Learn TF-IDF Vectorization, and Cosine Similarity.

---

## 📌 Project Overview
This project is an automated FAQ Chatbot designed to answer questions about college admissions, courses, tuition fees, placements, hostel facilities, campus life, and exams. It uses Natural Language Processing (NLP) to understand user queries and matches them against a structured FAQ dataset stored in a CSV file.

If the similarity between the user's question and any predefined question is lower than a set threshold (e.g., **0.40**), the chatbot gracefully responds with:
> *"Sorry, I couldn't find a relevant answer."*

---

## ✨ Features
- 🤖 **NLP Preprocessing Engine**: Tokenization, lowercasing, punctuation removal, stop word filtering, and WordNet lemmatization.
- 📐 **Scikit-Learn TF-IDF Vectorizer**: Converts text documents into numerical vector space based on term frequency and inverse document frequency.
- 🎯 **Cosine Similarity Matching**: Measures the cosine of the angle between query vectors and FAQ vectors to identify the most accurate response.
- 💬 **Modern Glassmorphic Chat UI**: Built with HTML5, CSS3, and modern Vanilla JavaScript with responsive chat bubbles and smooth animations.
- 🌓 **Dark & Light Mode Toggle**: Seamless theme switching with persistent CSS variables.
- 🎤 **Voice Search (Speech-to-Text)**: Allows users to ask questions using their microphone via the Web Speech API.
- 📜 **Interactive Knowledge Base Drawer**: Allows searching and browsing all 45+ FAQ questions categorized by topic.
- 🚀 **RESTful Flask API**: Clean `POST /chat` endpoint returning JSON responses with similarity scores and matched categories.

---

## 📁 Folder Structure

```
faq-chatbot/
│
├── app.py              # Main Flask Backend Application & NLP Pipeline
├── requirements.txt    # Required Python Libraries & Versions
├── faq_data.csv        # Predefined Dataset (Category, Question, Answer)
├── README.md           # Documentation & Theoretical Guide
├── nltk_setup.py       # Automatic NLTK Resource Downloader
│
├── templates/
│   └── index.html      # Responsive Chat Interface HTML Template
│
├── static/
│   ├── style.css       # Custom Theme CSS Stylesheet
│   └── script.js       # Client-side Chat Controller & API Logic
│
└── screenshots/        # Preview Screenshots
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
Ensure you have **Python 3.8+** installed on your system.

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/faq-chatbot.git
cd faq-chatbot
```

### 3. Create a Virtual Environment (Recommended)
```bash
# On Linux / macOS
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 🚀 Running the Project

### Step 1: Initialize NLTK Packages (Optional - Handled automatically on app startup)
```bash
python nltk_setup.py
```

### Step 2: Start the Flask Web Server
```bash
python app.py
```

### Step 3: Open in Browser
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🧠 How the Machine Learning & NLP System Works

### 1. NLP Preprocessing Pipeline (NLTK)
Raw human language is noisy. The preprocessing pipeline cleans text into canonical tokens:
1. **Lowercasing**: Standardizes text (`"Admissions"` &rarr; `"admissions"`).
2. **Punctuation Removal**: Strips punctuation characters (`"what's?"` &rarr; `"whats"`).
3. **Tokenization**: Splits text strings into word arrays using `nltk.word_tokenize`.
4. **Stop Word Filtering**: Removes non-informative words like `"is"`, `"the"`, `"at"`, `"of"`.
5. **Lemmatization**: Reduces words to their dictionary root form using NLTK's `WordNetLemmatizer` (`"fees"` &rarr; `"fee"`, `"courses"` &rarr; `"course"`).

---

### 2. TF-IDF Vectorization
**TF-IDF** stands for **Term Frequency - Inverse Document Frequency**. It measures how important a word is to a document relative to a corpus of documents.

$$TF(t, d) = \frac{\text{Number of times term } t \text{ appears in document } d}{\text{Total number of terms in document } d}$$

$$IDF(t, D) = \log\left(\frac{\text{Total number of documents } |D|}{\text{Number of documents containing term } t}\right)$$

$$TF\text{-}IDF(t, d, D) = TF(t, d) \times IDF(t, D)$$

---

### 3. Cosine Similarity Calculation
Cosine similarity measures the similarity between two non-zero vectors in an inner product space. It measures the cosine of the angle $\theta$ between them:

$$\text{Cosine Similarity}(\vec{A}, \vec{B}) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}$$

- **Score = 1.0**: Perfect semantic direction alignment.
- **Score = 0.0**: Completely orthogonal (no shared TF-IDF terms).
- **Threshold (&ge; 0.40)**: If the maximum calculated similarity is $< 0.40$, the query is considered out-of-scope.

---

## 📡 API Endpoint Reference

### `POST /chat`
**Request Headers:** `Content-Type: application/json`

**Sample Request Body:**
```json
{
  "message": "What is the fee for B.Tech CSE?"
}
```

**Sample Response Body:**
```json
{
  "answer": "The annual tuition fee for B.Tech is $3,500 (approx. ₹1,20,000) per academic year, excluding hostel and bus transportation charges.",
  "category": "Fees & Scholarships",
  "matched_question": "What is the annual tuition fee for B.Tech?",
  "similarity": 0.8245
}
```

---

## ☁️ Deployment Guide (Render)

1. Push your repository to **GitHub**.
2. Create a new **Web Service** on [Render.com](https://render.com).
3. Select your repository.
4. Set Build Command: `pip install -r requirements.txt`
5. Set Start Command: `gunicorn app:app`
6. Deploy!

---

## 📜 License
This project is open-source under the MIT License.

<img width="1901" height="860" alt="Screenshot 2026-07-30 193541" src="https://github.com/user-attachments/assets/4955c00c-01ce-4fed-a762-66da598846b8" />

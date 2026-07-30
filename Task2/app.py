"""
=============================================================================
NLP-Based FAQ Chatbot Using Python, Flask, NLTK, TF-IDF & Cosine Similarity
=============================================================================
Author: College Assistant AI Team
Description: A beginner-friendly Flask web application that utilizes Natural
Language Processing (NLP) techniques (tokenization, stop words removal,
lemmatization) alongside Scikit-Learn's TF-IDF Vectorizer and Cosine Similarity
to accurately answer user queries from a predefined FAQ dataset.
"""

import os
import re
import string
import pandas as pd
import numpy as np
from flask import Flask, render_template, request, jsonify

# NLTK imports for NLP preprocessing
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Scikit-Learn imports for Vectorization and Cosine Similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Import local NLTK downloader helper
from nltk_setup import download_nltk_resources

# Initialize Flask application
app = Flask(__name__, static_folder='static', template_folder='templates')

# ---------------------------------------------------------------------------
# 1. Automatic NLTK Resources Verification
# ---------------------------------------------------------------------------
download_nltk_resources()

# Initialize NLP Lemmatizer and Stopwords list
lemmatizer = WordNetLemmatizer()
try:
    stop_words = set(stopwords.words('english'))
except Exception:
    stop_words = set()

# ---------------------------------------------------------------------------
# 2. Text Preprocessing Function (NLP Pipeline)
# ---------------------------------------------------------------------------
def preprocess_text(text: str) -> str:
    """
    Applies standard NLP preprocessing steps to input text:
    1. Converts text to lowercase
    2. Removes punctuation and special characters
    3. Tokenizes the text into words
    4. Removes common stop words
    5. Applies lemmatization to reduce words to their base form
    """
    if not isinstance(text, str) or not text.strip():
        return ""

    # Step 1: Convert text to lowercase
    text = text.lower()

    # Step 2: Remove punctuation and numbers
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\d+', '', text)

    # Step 3: Tokenize text into words
    try:
        tokens = word_tokenize(text)
    except Exception:
        tokens = text.split()

    # Step 4 & 5: Remove stop words and lemmatize tokens
    cleaned_tokens = [
        lemmatizer.lemmatize(word)
        for word in tokens
        if word not in stop_words and len(word) > 1
    ]

    # Join tokens back into a space-separated string
    return " ".join(cleaned_tokens)


# ---------------------------------------------------------------------------
# 3. Load Dataset & Train TF-IDF Model
# ---------------------------------------------------------------------------
CSV_FILE = os.path.join(os.path.dirname(__file__), 'faq_data.csv')

def load_faq_dataset():
    """Loads FAQ data from CSV and handles fallback if file is missing."""
    if os.path.exists(CSV_FILE):
        df = pd.read_csv(CSV_FILE)
    else:
        # Fallback default dataset if CSV is absent
        df = pd.DataFrame([
            {"Category": "Admissions", "Question": "How can I apply?", "Answer": "Apply online at www.college.edu/apply."},
            {"Category": "Courses", "Question": "What courses are offered?", "Answer": "We offer B.Tech, M.Tech, MBA, MCA, and BBA."}
        ])
    return df

df_faq = load_faq_dataset()

# Apply preprocessing to all FAQ questions in dataset
df_faq['Preprocessed_Question'] = df_faq['Question'].apply(preprocess_text)

# Initialize TF-IDF Vectorizer
tfidf_vectorizer = TfidfVectorizer()

# Fit vectorizer and compute TF-IDF matrix for preprocessed FAQ questions
faq_tfidf_matrix = tfidf_vectorizer.fit_transform(df_faq['Preprocessed_Question'])


# ---------------------------------------------------------------------------
# 4. Core Similarity Search Logic
# ---------------------------------------------------------------------------
SIMILARITY_THRESHOLD = 0.40  # Minimum cosine similarity threshold

def get_best_faq_response(user_query: str):
    """
    Processes user query, computes cosine similarity against FAQ dataset,
    and returns the best matching answer or a polite fallback message.
    """
    # Step A: Preprocess the incoming user question
    preprocessed_query = preprocess_text(user_query)

    # If input is empty after preprocessing (e.g. only punctuation or stop words)
    if not preprocessed_query.strip():
        return {
            "answer": "I'm sorry, I couldn't understand your question. Could you please rephrase it with more details?",
            "similarity": 0.0,
            "category": "General",
            "matched_question": None
        }

    # Step B: Transform user query into TF-IDF vector space
    user_tfidf = tfidf_vectorizer.transform([preprocessed_query])

    # Step C: Compute cosine similarity between user query and all FAQ vectors
    similarities = cosine_similarity(user_tfidf, faq_tfidf_matrix).flatten()

    # Step D: Find index with the maximum cosine similarity score
    best_index = int(np.argmax(similarities))
    highest_similarity = float(similarities[best_index])

    # Step E: Evaluate against threshold
    if highest_similarity >= SIMILARITY_THRESHOLD:
        matched_row = df_faq.iloc[best_index]
        return {
            "answer": matched_row['Answer'],
            "similarity": round(highest_similarity, 4),
            "category": matched_row['Category'],
            "matched_question": matched_row['Question']
        }
    else:
        return {
            "answer": "Sorry, I couldn't find a relevant answer. You can try rephrasing your question or contact our Admissions Office at +1 (800) 555-COLLEGE.",
            "similarity": round(highest_similarity, 4),
            "category": "Unknown",
            "matched_question": None
        }


# ---------------------------------------------------------------------------
# 5. Flask Web Routes and API Endpoints
# ---------------------------------------------------------------------------
@app.route('/')
def home():
    """Renders the main Chat Interface HTML page."""
    return render_template('index.html')


@app.route('/chat', methods=['POST'])
def chat():
    """
    POST /chat Endpoint
    Request Payload:  { "message": "User question" }
    Response Payload: { "answer": "Bot response", "category": "...", "similarity": 0.85 }
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        user_message = data.get('message', '').strip()

        if not user_message:
            return jsonify({
                "answer": "Please type a valid question so I can assist you."
            }), 400

        result = get_best_faq_response(user_message)
        return jsonify(result)

    except Exception as e:
        return jsonify({
            "answer": "An unexpected error occurred while processing your query.",
            "error": str(e)
        }), 500


@app.route('/api/faqs', methods=['GET'])
def get_faqs():
    """Returns all FAQ categories and questions for frontend filter & search."""
    categories = df_faq['Category'].unique().tolist()
    faq_list = df_faq[['Category', 'Question', 'Answer']].to_dict(orient='records')
    return jsonify({
        "categories": categories,
        "total_faqs": len(faq_list),
        "faqs": faq_list
    })


@app.route('/reset', methods=['POST'])
def reset_chat():
    """Reset chat session endpoint."""
    return jsonify({"status": "success", "message": "Chat session reset successfully."})


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment monitoring."""
    return jsonify({
        "status": "healthy",
        "faq_count": len(df_faq),
        "vocabulary_size": len(tfidf_vectorizer.vocabulary_)
    })


# ---------------------------------------------------------------------------
# 6. Server Launch
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    # Supports PORT environment variable or defaults to 5000 for local execution
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting FAQ Chatbot Server on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)

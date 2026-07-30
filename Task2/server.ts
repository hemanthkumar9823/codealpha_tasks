import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Helper to resolve files reliably across environments (Local, Vercel, Docker)
function getFilePath(...segments: string[]): string {
  const p1 = path.join(process.cwd(), ...segments);
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(__dirname, ...segments);
  if (fs.existsSync(p2)) return p2;
  const p3 = path.join(__dirname, '..', ...segments);
  if (fs.existsSync(p3)) return p3;
  return p1;
}

// Serve static assets from /static
app.use('/static', express.static(getFilePath('static')));

interface FaqItem {
  Category: string;
  Question: string;
  Answer: string;
  preprocessed: string[];
  ngrams: string[];
}

// English stop words list
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can",
  "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
  "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
  "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him",
  "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't",
  "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor",
  "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out",
  "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
  "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
  "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to",
  "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
  "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've",
  "your", "yours", "yourself", "yourselves"
]);

// Helper lemmatizer function
function lemmatizeWord(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("es") && !word.endsWith("ses") && !word.endsWith("ches")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  if (word.endsWith("ing") && word.length > 5) return word.slice(0, -3);
  if (word.endsWith("ed") && word.length > 4) return word.slice(0, -2);
  return word;
}

// NLP Preprocessing & N-Gram Generation
function preprocessText(text: string): string[] {
  if (!text) return [];
  const cleaned = text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\d+/g, ' ');
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const processed = tokens
    .filter(t => !STOP_WORDS.has(t) && t.length > 1)
    .map(lemmatizeWord);
  return processed;
}

function generateNgrams(tokens: string[]): string[] {
  const ngrams = [...tokens];
  for (let i = 0; i < tokens.length - 1; i++) {
    ngrams.push(`${tokens[i]}_${tokens[i+1]}`);
  }
  return ngrams;
}

// CSV Parser
function parseCSV(csvContent: string): FaqItem[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    }
    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim()) lines.push(currentLine.trim());
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());

  if (lines.length <= 1) return [];

  const items: FaqItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const row: string[] = [];
    let field = '';
    let insideQuote = false;

    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        insideQuote = !insideQuote;
      } else if (c === ',' && !insideQuote) {
        row.push(field.trim());
        field = '';
      } else {
        field += c;
      }
    }
    row.push(field.trim());

    if (row.length >= 3) {
      const category = row[0].replace(/^"|"$/g, '');
      const question = row[1].replace(/^"|"$/g, '');
      const answer = row[2].replace(/^"|"$/g, '');
      const preprocessed = preprocessText(question);
      const ngrams = generateNgrams(preprocessed);
      items.push({ Category: category, Question: question, Answer: answer, preprocessed, ngrams });
    }
  }
  return items;
}

// Load dataset
const jsonPath = getFilePath('knowledge.json');
const csvPath = getFilePath('faq_data.csv');
let faqData: FaqItem[] = [];

if (fs.existsSync(jsonPath)) {
  try {
    const rawJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    if (Array.isArray(rawJson)) {
      faqData = rawJson.map((item: any) => {
        const category = item.category || item.Category || 'General';
        const question = item.question || item.Question || '';
        const answer = item.answer || item.Answer || '';
        const preprocessed = preprocessText(question);
        const ngrams = generateNgrams(preprocessed);
        return { Category: category, Question: question, Answer: answer, preprocessed, ngrams };
      });
    }
  } catch (err) {
    console.error('Failed to parse knowledge.json:', err);
  }
}

if (faqData.length === 0 && fs.existsSync(csvPath)) {
  faqData = parseCSV(fs.readFileSync(csvPath, 'utf-8'));
}

// Build TF-IDF Vocabulary & Vectors
const dfMap = new Map<string, number>();
const N = faqData.length;

faqData.forEach(item => {
  const uniqueTerms = new Set(item.ngrams);
  uniqueTerms.forEach(term => {
    dfMap.set(term, (dfMap.get(term) || 0) + 1);
  });
});

function getTfidfVector(ngrams: string[]): Map<string, number> {
  const tfMap = new Map<string, number>();
  ngrams.forEach(t => tfMap.set(t, (tfMap.get(t) || 0) + 1));

  const tfidf = new Map<string, number>();
  tfMap.forEach((count, term) => {
    const tf = count / (ngrams.length || 1);
    const df = dfMap.get(term) || 0;
    const idf = Math.log((N + 1) / (df + 1)) + 1;
    tfidf.set(term, tf * idf);
  });
  return tfidf;
}

const faqVectors = faqData.map(item => getTfidfVector(item.ngrams));

function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  vecA.forEach((val, key) => {
    normA += val * val;
    if (vecB.has(key)) {
      dotProduct += val * vecB.get(key)!;
    }
  });

  vecB.forEach(val => {
    normB += val * val;
  });

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  setA.forEach(val => {
    if (setB.has(val)) intersection++;
  });
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// Smart Answer Formatting Transformer
function formatAnswerStructure(answer: string, category: string): string {
  if (!answer) return answer;
  
  // If already contains markdown, leave formatted
  if (answer.includes('\n\n') || answer.includes('• ') || answer.includes('- ')) {
    return answer;
  }

  // Format list items inside answer if present
  let formatted = answer;

  // Highlight companies or recruiters if present
  if (formatted.includes("include TCS,") || formatted.includes(" recruiters include")) {
    formatted = formatted.replace(
      /(TCS,\s*Infosys[^\.]*)/g,
      '\n\n**Top Recruiting Partners:**\n- $1'
    );
  }

  // Highlight branches if present
  if (formatted.includes("offers Computer Science") || formatted.includes("offers B.Tech")) {
    formatted = formatted.replace(
      /(Computer Science & Engineering[^\.]*)/g,
      '\n\n**Specializations & Branches:**\n- $1'
    );
  }

  // Highlight documents required
  if (formatted.includes("10th and Intermediate marks memos")) {
    formatted = formatted.replace(
      /(10th and Intermediate[^\.]*)/g,
      '\n\n**Document Checklist:**\n- $1'
    );
  }

  return formatted;
}

// Routes
app.get('/', (req, res) => {
  const htmlPath = getFilePath('templates', 'index.html');
  res.sendFile(htmlPath);
});

app.post('/chat', (req, res) => {
  const userMessage = req.body?.message || '';
  if (!userMessage.trim()) {
    return res.status(400).json({ answer: "Please type a valid question so I can assist you." });
  }

  const queryTokens = preprocessText(userMessage);
  if (queryTokens.length === 0) {
    return res.json({
      answer: "I couldn't quite understand your query. Could you please rephrase or pick a topic below?",
      category: "General",
      matched_question: null,
      similarity: 0.0,
      suggestions: [
        "What degree courses are offered?",
        "What is the eligibility for B.Tech admission?",
        "What is the highest placement package?",
        "Where is the campus located?"
      ]
    });
  }

  const queryNgrams = generateNgrams(queryTokens);
  const queryVector = getTfidfVector(queryNgrams);
  const querySet = new Set(queryNgrams);

  const scoredCandidates: { index: number; score: number; tfidf: number; jaccard: number }[] = [];

  for (let i = 0; i < faqData.length; i++) {
    const tfidfScore = cosineSimilarity(queryVector, faqVectors[i]);
    const jaccardScore = jaccardSimilarity(querySet, new Set(faqData[i].ngrams));
    
    // Hybrid score blending TF-IDF Cosine & Jaccard
    let combinedScore = (tfidfScore * 0.70) + (jaccardScore * 0.30);

    // Exact word boost for short domain queries
    const lowerQuery = userMessage.toLowerCase();
    const lowerQ = faqData[i].Question.toLowerCase();
    if (lowerQuery.includes('fee') && lowerQ.includes('fee')) combinedScore += 0.15;
    if (lowerQuery.includes('hostel') && lowerQ.includes('hostel')) combinedScore += 0.15;
    if (lowerQuery.includes('placement') && lowerQ.includes('placement')) combinedScore += 0.15;
    if (lowerQuery.includes('location') && lowerQ.includes('located')) combinedScore += 0.15;
    if (lowerQuery.includes('code') && lowerQ.includes('code')) combinedScore += 0.15;

    scoredCandidates.push({ index: i, score: combinedScore, tfidf: tfidfScore, jaccard: jaccardScore });
  }

  scoredCandidates.sort((a, b) => b.score - a.score);

  const topMatch = scoredCandidates[0];
  const HIGH_CONFIDENCE = 0.25;
  const MEDIUM_CONFIDENCE = 0.12;

  if (topMatch && topMatch.score >= HIGH_CONFIDENCE) {
    const matched = faqData[topMatch.index];
    const formattedAnswer = formatAnswerStructure(matched.Answer, matched.Category);

    // Provide 2 related questions if available
    const suggestions = scoredCandidates
      .slice(1, 4)
      .filter(c => c.score >= MEDIUM_CONFIDENCE)
      .map(c => faqData[c.index].Question);

    return res.json({
      answer: formattedAnswer,
      category: matched.Category,
      matched_question: matched.Question,
      similarity: Number(topMatch.score.toFixed(4)),
      suggestions: suggestions
    });
  } else if (topMatch && topMatch.score >= MEDIUM_CONFIDENCE) {
    const matched = faqData[topMatch.index];
    const suggestions = scoredCandidates
      .slice(0, 3)
      .map(c => faqData[c.index].Question);

    return res.json({
      answer: formatAnswerStructure(matched.Answer, matched.Category),
      category: matched.Category,
      matched_question: matched.Question,
      similarity: Number(topMatch.score.toFixed(4)),
      suggestions: suggestions
    });
  } else {
    // Top category popular suggestions fallback
    const suggestions = [
      "What B.Tech branches are offered?",
      "How can I get admission to Avanthi?",
      "What is the average placement package?",
      "Are hostel and transport facilities available?"
    ];

    return res.json({
      answer: "I couldn't find an exact match for your question. Here are some popular topics you might be interested in:",
      category: "Help",
      matched_question: null,
      similarity: Number(topMatch ? topMatch.score.toFixed(4) : 0),
      suggestions: suggestions
    });
  }
});

app.get('/api/faqs', (req, res) => {
  const categories = Array.from(new Set(faqData.map(f => f.Category)));
  res.json({
    categories,
    total_faqs: faqData.length,
    faqs: faqData.map(f => ({ Category: f.Category, Question: f.Question, Answer: f.Answer }))
  });
});

app.post('/reset', (req, res) => {
  res.json({ status: "success", message: "Chat session reset successfully." });
});

app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", faq_count: faqData.length });
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;

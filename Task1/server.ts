import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const PORT = 3000;

// Initialize Gemini SDK with User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();

  // Middleware for parsing JSON and base64 payloads
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // ==========================================
  // API ROUTES
  // ==========================================

  // Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", hasApiKey: !!process.env.GEMINI_API_KEY });
  });

  // 1. Core Text Translation API
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, sourceLang = "auto", targetLang = "es", formality = "neutral", style = "general" } = req.body;

      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Text to translate is required" });
      }

      const startTime = Date.now();

      // Check if Gemini API Key is available
      if (!process.env.GEMINI_API_KEY) {
        // Fallback simulated translation when key is missing or offline
        const mockTranslation = `[Translated to ${targetLang}]: ${text}`;
        return res.json({
          translatedText: mockTranslation,
          detectedSourceLang: sourceLang === "auto" ? "English" : sourceLang,
          confidence: 0.95,
          wordCount: text.split(/\s+/).filter(Boolean).length,
          sentenceCount: text.split(/[.!?]+/).filter(Boolean).length || 1,
          readingTimeSeconds: Math.max(1, Math.ceil(text.split(/\s+/).length / 3)),
          executionTimeMs: Date.now() - startTime,
          alternativeTranslations: [`Alternative version in ${targetLang} of: ${text}`],
          dictionaryNotes: `Simulated offline response for target language (${targetLang}).`
        });
      }

      const prompt = `You are a professional translator and linguist. Translate the following text into the target language.
Text to translate:
"""
${text}
"""

Source language specified: ${sourceLang} (if 'auto' or 'Detect Language', detect the source language automatically).
Target language: ${targetLang}
Formality tone: ${formality}
Domain style: ${style}

Respond ONLY in valid JSON format matching this schema:
{
  "translatedText": "The accurate, natural translation",
  "detectedSourceLangName": "Detected language full name in English (e.g. English, Spanish, Japanese)",
  "detectedSourceLangCode": "2-letter ISO code if applicable (e.g. en, es, ja, fr)",
  "confidenceScore": 0.98,
  "alternativeTranslations": ["Alternative 1", "Alternative 2"],
  "dictionaryNotes": "Key grammatical or linguistic nuances or definitions if applicable"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedText: { type: Type.STRING },
              detectedSourceLangName: { type: Type.STRING },
              detectedSourceLangCode: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              alternativeTranslations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              dictionaryNotes: { type: Type.STRING }
            },
            required: ["translatedText", "detectedSourceLangName", "confidenceScore"]
          }
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText);

      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
      const readingTimeSeconds = Math.max(1, Math.ceil(words / 3.5));
      const executionTimeMs = Date.now() - startTime;

      res.json({
        translatedText: result.translatedText || text,
        detectedSourceLangName: result.detectedSourceLangName || "Unknown",
        detectedSourceLangCode: result.detectedSourceLangCode || sourceLang,
        confidence: result.confidenceScore || 0.99,
        wordCount: words,
        sentenceCount: sentences,
        readingTimeSeconds,
        executionTimeMs,
        alternativeTranslations: result.alternativeTranslations || [],
        dictionaryNotes: result.dictionaryNotes || ""
      });
    } catch (err: any) {
      console.error("Translation API error:", err);
      res.status(500).json({ error: err?.message || "Translation service error" });
    }
  });

  // 2. Language Auto-Detection API
  app.post("/api/detect", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Text is required for language detection" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({ languageName: "English", languageCode: "en", confidence: 0.99 });
      }

      const prompt = `Identify the natural language of this text: "${text.slice(0, 300)}".
Return JSON with languageName, languageCode (ISO 639-1), and confidence (0.0 to 1.0).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              languageName: { type: Type.STRING },
              languageCode: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            },
            required: ["languageName", "languageCode", "confidence"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (err: any) {
      console.error("Detection error:", err);
      res.status(500).json({ error: "Detection failed" });
    }
  });

  // 3. Image OCR Text Extraction & Translation
  app.post("/api/ocr", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", targetLang = "en" } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Image data is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          extractedText: "Sample extracted OCR text from image: Hello, World!",
          translatedText: `[OCR Translated to ${targetLang}]: Hello, World!`,
          detectedLang: "English"
        });
      }

      // Remove data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const imagePart = {
        inlineData: {
          mimeType,
          data: cleanBase64
        }
      };

      const promptPart = {
        text: `You are an advanced OCR and Translation assistant.
1. Extract ALL readable text visible in this image accurately.
2. Detect the source language.
3. Translate the extracted text into target language: "${targetLang}".

Respond in JSON format with keys:
- "extractedText": "Original text extracted from image",
- "translatedText": "Translated text in target language",
- "detectedLang": "Language name of the extracted text"`
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: { parts: [imagePart, promptPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              extractedText: { type: Type.STRING },
              translatedText: { type: Type.STRING },
              detectedLang: { type: Type.STRING }
            },
            required: ["extractedText", "translatedText", "detectedLang"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (err: any) {
      console.error("OCR error:", err);
      res.status(500).json({ error: err?.message || "OCR extraction failed" });
    }
  });

  // 4. Document Parsing & Translation API
  app.post("/api/document", async (req, res) => {
    try {
      const { fileBase64, mimeType, fileName, sourceLang = "auto", targetLang = "es" } = req.body;

      if (!fileBase64 && !req.body.text) {
        return res.status(400).json({ error: "File data or text content is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        const textContent = req.body.text || "Document contents processed successfully.";
        return res.json({
          fileName: fileName || "document.txt",
          extractedText: textContent,
          translatedText: `[Document Translated to ${targetLang}]:\n\n${textContent}`,
          wordCount: textContent.split(/\s+/).length,
          pageCount: 1
        });
      }

      let responseText = "";

      if (fileBase64 && (mimeType.includes("pdf") || mimeType.includes("image") || mimeType.includes("text"))) {
        const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
        const docPart = {
          inlineData: {
            mimeType,
            data: cleanBase64
          }
        };
        const promptPart = {
          text: `Read this attached document carefully.
1. Extract all text content from the document while preserving headers and paragraphs.
2. Translate the entire document content into target language: "${targetLang}" (Source language: ${sourceLang}).

Respond in JSON format:
{
  "extractedText": "Full text extracted from document",
  "translatedText": "Accurate translated document content in target language",
  "detectedLang": "Detected source language name",
  "summary": "Brief 1-sentence document summary"
}`
        };

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: { parts: [docPart, promptPart] },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                extractedText: { type: Type.STRING },
                translatedText: { type: Type.STRING },
                detectedLang: { type: Type.STRING },
                summary: { type: Type.STRING }
              },
              required: ["extractedText", "translatedText", "detectedLang"]
            }
          }
        });
        responseText = response.text || "{}";
      } else {
        // Text-based fallback
        const textContent = req.body.text || "";
        const prompt = `Translate this document text into ${targetLang}:
"""
${textContent}
"""
Respond in JSON format with "extractedText" and "translatedText".`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        responseText = response.text || "{}";
      }

      const result = JSON.parse(responseText);
      res.json({
        fileName: fileName || "document.txt",
        extractedText: result.extractedText || "",
        translatedText: result.translatedText || "",
        detectedLang: result.detectedLang || sourceLang,
        summary: result.summary || "",
        wordCount: (result.translatedText || "").split(/\s+/).filter(Boolean).length
      });
    } catch (err: any) {
      console.error("Document API error:", err);
      res.status(500).json({ error: err?.message || "Document translation failed" });
    }
  });

  // 5. Dictionary & Word Insights API
  app.post("/api/dictionary", async (req, res) => {
    try {
      const { word, sourceLang = "en", targetLang = "es" } = req.body;
      if (!word) return res.status(400).json({ error: "Word parameter is required" });

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          word,
          partOfSpeech: "noun",
          definition: `Meaning of ${word} in ${sourceLang}`,
          translation: `Translation of ${word} in ${targetLang}`,
          synonyms: ["example1", "example2"],
          examples: [`Sentence containing ${word}.`]
        });
      }

      const prompt = `Provide detailed dictionary definition and translation for the word/phrase: "${word}".
Source language: ${sourceLang}, Target language: ${targetLang}.
Return JSON with:
- word
- partOfSpeech
- definition
- translation
- pronunciation (phonetic)
- synonyms (array of strings)
- examples (array of example sentences with target translations)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              partOfSpeech: { type: Type.STRING },
              definition: { type: Type.STRING },
              translation: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
              synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
              examples: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["word", "definition", "translation"]
          }
        }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (err: any) {
      res.status(500).json({ error: "Dictionary lookup failed" });
    }
  });

  // Vite development middleware vs production static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

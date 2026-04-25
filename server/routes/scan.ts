import { Router, RequestHandler } from "express";
import fetch from "node-fetch";

const router = Router();
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// Database nutrisi per 100g
const NUTRITION_DB: Record<string, { calories: number; protein: number; carbs: number; fat: number; fiber: number }> = {
  beef: { calories: 250, protein: 26, carbs: 0, fat: 17, fiber: 0 },
  brisket: { calories: 290, protein: 28, carbs: 0, fat: 19, fiber: 0 },
  chicken: { calories: 165, protein: 31, carbs: 0, fat: 4, fiber: 0 },
  chicken_breast: { calories: 165, protein: 31, carbs: 0, fat: 4, fiber: 0 },
  pork: { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0 },
  lamb: { calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0 },
  fish: { calories: 136, protein: 26, carbs: 0, fat: 3, fiber: 0 },
  salmon: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
  tuna: { calories: 132, protein: 28, carbs: 0, fat: 1, fiber: 0 },
  shrimp: { calories: 99, protein: 24, carbs: 0, fat: 0, fiber: 0 },
  egg: { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0 },
  broccoli: { calories: 34, protein: 3, carbs: 7, fat: 0, fiber: 3 },
  carrot: { calories: 41, protein: 1, carbs: 10, fat: 0, fiber: 3 },
  spinach: { calories: 23, protein: 3, carbs: 4, fat: 0, fiber: 2 },
  tomato: { calories: 18, protein: 1, carbs: 4, fat: 0, fiber: 1 },
  potato: { calories: 77, protein: 2, carbs: 17, fat: 0, fiber: 2 },
  onion: { calories: 40, protein: 1, carbs: 9, fat: 0, fiber: 2 },
  cabbage: { calories: 25, protein: 1, carbs: 6, fat: 0, fiber: 2 },
  corn: { calories: 86, protein: 3, carbs: 19, fat: 1, fiber: 2 },
  apple: { calories: 52, protein: 0, carbs: 14, fat: 0, fiber: 2 },
  banana: { calories: 89, protein: 1, carbs: 23, fat: 0, fiber: 3 },
  avocado: { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
  orange: { calories: 47, protein: 1, carbs: 12, fat: 0, fiber: 2 },
  mango: { calories: 60, protein: 1, carbs: 15, fat: 0, fiber: 2 },
  pineapple: { calories: 50, protein: 1, carbs: 13, fat: 0, fiber: 1 },
  watermelon: { calories: 30, protein: 1, carbs: 8, fat: 0, fiber: 0 },
  strawberry: { calories: 32, protein: 1, carbs: 8, fat: 0, fiber: 2 },
  rice: { calories: 130, protein: 3, carbs: 28, fat: 0, fiber: 0 },
  bread: { calories: 265, protein: 9, carbs: 49, fat: 3, fiber: 3 },
  pasta: { calories: 131, protein: 5, carbs: 25, fat: 1, fiber: 2 },
  tofu: { calories: 76, protein: 8, carbs: 2, fat: 5, fiber: 0 },
  tempeh: { calories: 193, protein: 19, carbs: 9, fat: 11, fiber: 0 },
  salad: { calories: 20, protein: 2, carbs: 4, fat: 0, fiber: 2 },
  fruit_salad: { calories: 60, protein: 1, carbs: 15, fat: 0, fiber: 2 },
  antipasto_salad: { calories: 180, protein: 8, carbs: 6, fat: 14, fiber: 2 },
};

function getNutrition(ingredient: string) {
  const lower = ingredient.toLowerCase().replace(/\s+/g, "_");
  if (NUTRITION_DB[lower]) return NUTRITION_DB[lower];
  for (const key of Object.keys(NUTRITION_DB)) {
    if (lower.includes(key) || key.includes(lower)) return NUTRITION_DB[key];
  }
  return { calories: 120, protein: 6, carbs: 12, fat: 4, fiber: 1 };
}

const analyzeImage: RequestHandler = async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) { res.status(400).json({ error: "imageBase64 wajib diisi" }); return; }
  if (!GEMINI_KEY) { res.status(500).json({ error: "GEMINI_API_KEY belum diatur di .env" }); return; }

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Coba gemini-1.5-flash dulu (free tier), fallback ke 2.0-flash-lite
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
    let lastError = "";
    
    for (const model of models) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: "image/jpeg", data: base64Data } },
                { text: `Identify the main food ingredient in this image. Respond ONLY with valid JSON, no markdown:\n{"ingredient":"english name lowercase with underscores (e.g. chicken_breast, broccoli, avocado)","confidence":number 85-99,"description":"short description in Bahasa Indonesia"}` }
              ]
            }],
            generationConfig: { maxOutputTokens: 150, temperature: 0.1 }
          }),
        }
      );

      const data = (await response.json()) as any;
      if (response.status === 429 || response.status === 402) {
        lastError = data.error?.message || "quota exceeded";
        continue; // coba model berikutnya
      }
      if (!response.ok) {
        res.status(response.status).json({ error: data.error?.message || "Gemini API error" });
        return;
      }

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const cleanText = rawText.replace(/```json|```/g, "").trim();
      let parsed: any = {};
      try { parsed = JSON.parse(cleanText); } catch { parsed = { ingredient: "beef", confidence: 80 }; }

      const ingredient = parsed.ingredient || "beef";
      res.json({ ingredient, confidence: parsed.confidence || 85, description: parsed.description || "", nutrition: getNutrition(ingredient) });
      return;
    }

    // Semua model habis quota — fallback manual
    res.status(429).json({ error: `Semua Gemini model quota habis: ${lastError}` });
  } catch (err: any) {
    console.error("Scan error:", err);
    res.status(500).json({ error: "Gagal menganalisis gambar: " + err.message });
  }
};

router.post("/analyze", analyzeImage);
export { router as scanRoutes };
import { Router, RequestHandler } from "express";
import fetch from "node-fetch";

const router = Router();
const GEMINI_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `Kamu adalah GiziBot, asisten nutrisi cerdas dari aplikasi GiziMeal.
Tugasmu adalah membantu pengguna dengan:
- Informasi kandungan gizi bahan makanan
- Rekomendasi menu sehat berdasarkan bahan yang dimiliki
- Saran pola makan sehat
- Penjelasan tentang kebutuhan kalori dan nutrisi harian

Berikan jawaban dalam Bahasa Indonesia yang ramah, informatif, dan mudah dipahami.
Selalu berikan informasi yang akurat dan berbasis ilmu gizi.
Jika ditanya resep, berikan langkah-langkah yang praktis.
Gunakan format yang rapi dengan poin-poin jika perlu.`;

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];

const chat: RequestHandler = async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages wajib berupa array" });
    return;
  }

  if (!GEMINI_KEY) {
    res.status(500).json({ error: "GEMINI_API_KEY belum diatur di Railway Variables" });
    return;
  }

  const geminiMessages = messages.map((m: { role: string; content: string }) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Coba beberapa model sampai berhasil
  for (const model of MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: geminiMessages,
            generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
          }),
        }
      );

      // Kalau rate limit, coba model berikutnya
      if (response.status === 429 || response.status === 402) continue;

      const data = (await response.json()) as any;

      if (!response.ok) {
        console.error(`Gemini ${model} error:`, data);
        continue;
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        "Maaf, saya tidak dapat menjawab saat ini.";

      res.json({ reply, model });
      return;
    } catch (err) {
      console.error(`Gemini ${model} failed:`, err);
      continue;
    }
  }

  res.status(503).json({ error: "Semua model Gemini sedang tidak tersedia. Coba lagi sebentar." });
};

router.post("/", chat);

export { router as chatRoutes };
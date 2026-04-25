import { Router, RequestHandler } from "express";
import fetch from "node-fetch";

const router = Router();
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
const MEALDB = "https://www.themealdb.com/api/json/v1/1";

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY belum diatur");
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 4096, temperature: 0.5 },
          }),
        }
      );
      if (res.status === 429 || res.status === 402) continue;
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error?.message);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log(`[Gemini ${model}] Response length: ${text.length} chars`);
      return text;
    } catch (e: any) {
      console.error(`Model ${model} error:`, e.message);
      continue;
    }
  }
  throw new Error("Semua model Gemini tidak tersedia");
}

// Robust JSON extractor - cari dari index [ atau { pertama ke ] atau } terakhir
function extractJSON(text: string): any {
  const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  // Coba parse langsung dulu
  try { return JSON.parse(clean); } catch {}

  // Cari array: dari [ pertama ke ] terakhir
  const arrStart = clean.indexOf("[");
  const arrEnd = clean.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd > arrStart) {
    try { return JSON.parse(clean.substring(arrStart, arrEnd + 1)); } catch (e) {
      console.error("Array parse fail:", (e as any).message?.substring(0, 100));
    }
  }

  // Cari object: dari { pertama ke } terakhir
  const objStart = clean.indexOf("{");
  const objEnd = clean.lastIndexOf("}");
  if (objStart !== -1 && objEnd > objStart) {
    try { return JSON.parse(clean.substring(objStart, objEnd + 1)); } catch (e) {
      console.error("Object parse fail:", (e as any).message?.substring(0, 100));
    }
  }

  console.error("Gagal parse JSON, sample:", clean.substring(0, 200));
  return null;
}

async function searchMealDB(ingredient: string): Promise<any[]> {
  const res = await fetch(`${MEALDB}/filter.php?i=${encodeURIComponent(ingredient)}`);
  const data = (await res.json()) as any;
  const meals: any[] = (data.meals || []).slice(0, 4);

  const detailed = await Promise.all(meals.map(async (meal: any) => {
    try {
      const dr = await fetch(`${MEALDB}/lookup.php?i=${meal.idMeal}`);
      const dd = (await dr.json()) as any;
      const m = dd.meals?.[0];
      if (!m) return null;

      const ingredientList: string[] = [];
      for (let i = 1; i <= 20; i++) {
        const ing = m[`strIngredient${i}`]?.trim();
        const measure = m[`strMeasure${i}`]?.trim();
        if (ing) ingredientList.push(`${measure || ""} ${ing}`.trim());
      }

      const calMap: Record<string, number> = {
        Beef: 280, Chicken: 200, Lamb: 260, Seafood: 180, Vegetarian: 150,
        Pasta: 320, Dessert: 400, Breakfast: 350, Miscellaneous: 250,
      };
      const estCal = calMap[m.strCategory] || 250;

      return {
        id: m.idMeal,
        title: m.strMeal,
        image: m.strMealThumb,
        readyInMinutes: 30,
        servings: 2,
        instructions: m.strInstructions || "",
        ingredientList,
        youtubeUrl: m.strYoutube || "",
        source: "mealdb",
        nutrition: {
          nutrients: [
            { name: "Calories", amount: estCal, unit: "kcal" },
            { name: "Protein", amount: Math.round(estCal * 0.15 / 4), unit: "g" },
            { name: "Carbohydrates", amount: Math.round(estCal * 0.5 / 4), unit: "g" },
            { name: "Fat", amount: Math.round(estCal * 0.3 / 9), unit: "g" },
          ],
        },
      };
    } catch { return null; }
  }));

  return detailed.filter(Boolean);
}

// Gemini fallback: generate 2 resep saja supaya tidak terpotong
async function generateGeminiRecipes(ingredient: string): Promise<any[]> {
  const prompt = `Buatkan 2 resep masakan Indonesia menggunakan "${ingredient}" sebagai bahan utama.
Balas HANYA dengan JSON array berikut (isi dengan data resep nyata):
[
  {
    "id": 101,
    "title": "Nama Resep Pertama",
    "readyInMinutes": 30,
    "servings": 2,
    "instructions": "1. Langkah pertama\\n2. Langkah kedua\\n3. Langkah ketiga",
    "ingredientList": ["200g ${ingredient}", "2 siung bawang putih", "garam secukupnya"],
    "source": "gemini",
    "nutrition": {
      "nutrients": [
        {"name": "Calories", "amount": 300, "unit": "kcal"},
        {"name": "Protein", "amount": 15, "unit": "g"},
        {"name": "Carbohydrates", "amount": 35, "unit": "g"},
        {"name": "Fat", "amount": 10, "unit": "g"}
      ]
    }
  },
  {
    "id": 102,
    "title": "Nama Resep Kedua",
    "readyInMinutes": 20,
    "servings": 2,
    "instructions": "1. Langkah pertama\\n2. Langkah kedua\\n3. Langkah ketiga",
    "ingredientList": ["150g ${ingredient}", "1 buah tomat", "garam secukupnya"],
    "source": "gemini",
    "nutrition": {
      "nutrients": [
        {"name": "Calories", "amount": 250, "unit": "kcal"},
        {"name": "Protein", "amount": 10, "unit": "g"},
        {"name": "Carbohydrates", "amount": 30, "unit": "g"},
        {"name": "Fat", "amount": 8, "unit": "g"}
      ]
    }
  }
]`;

  const raw = await callGemini(prompt);
  const parsed = extractJSON(raw);
  if (!Array.isArray(parsed)) {
    console.error("Gemini tidak return array, got:", typeof parsed);
    return [];
  }
  return parsed;
}

// GET /api/recipes/search?ingredients=banana&number=4
const searchByIngredients: RequestHandler = async (req, res) => {
  const { ingredients } = req.query;
  if (!ingredients) { res.status(400).json({ error: "ingredients wajib diisi" }); return; }

  try {
    console.log(`[Recipes] Mencari resep untuk: "${ingredients}"`);

    // 1. TheMealDB dulu
    let recipes = await searchMealDB(ingredients as string);
    console.log(`[MealDB] Ditemukan ${recipes.length} resep`);

    // 2. Fallback ke Gemini jika MealDB kosong
    if (recipes.length === 0 && GEMINI_KEY) {
      console.log("[Recipes] MealDB kosong, coba Gemini...");
      recipes = await generateGeminiRecipes(ingredients as string);
      console.log(`[Gemini] Generated ${recipes.length} resep`);
    }

    res.json(recipes);
  } catch (err: any) {
    console.error("Recipe search error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/recipes/:id
const getRecipeDetail: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { title, ingredient, source } = req.query;

  try {
    // MealDB lookup jika id > 10000 atau source=mealdb
    if (source === "mealdb" || Number(id) > 10000) {
      const r = await fetch(`${MEALDB}/lookup.php?i=${id}`);
      const d = (await r.json()) as any;
      const m = d.meals?.[0];
      if (m) {
        const ingredients: { id: number; name: string; amount: number; unit: string }[] = [];
        for (let i = 1; i <= 20; i++) {
          const ing = m[`strIngredient${i}`]?.trim();
          const measure = m[`strMeasure${i}`]?.trim();
          if (ing) ingredients.push({ id: i, name: ing, amount: 1, unit: measure || "" });
        }
        const calMap: Record<string, number> = {
          Beef: 280, Chicken: 200, Lamb: 260, Seafood: 180, Vegetarian: 150,
          Pasta: 320, Dessert: 400, Breakfast: 350, Miscellaneous: 250,
        };
        const estCal = calMap[m.strCategory] || 250;
        res.json({
          id: m.idMeal, title: m.strMeal, image: m.strMealThumb,
          readyInMinutes: 30, servings: 2,
          summary: `${m.strMeal} adalah masakan ${m.strArea || ""} kategori ${m.strCategory || ""}.`,
          instructions: m.strInstructions || "",
          extendedIngredients: ingredients,
          nutrition: {
            nutrients: [
              { name: "Calories", amount: estCal, unit: "kcal", percentOfDailyNeeds: Math.round(estCal / 20) },
              { name: "Protein", amount: Math.round(estCal * 0.15 / 4), unit: "g", percentOfDailyNeeds: 20 },
              { name: "Carbohydrates", amount: Math.round(estCal * 0.5 / 4), unit: "g", percentOfDailyNeeds: 15 },
              { name: "Fat", amount: Math.round(estCal * 0.3 / 9), unit: "g", percentOfDailyNeeds: 13 },
            ],
          },
        });
        return;
      }
    }

    // Fallback Gemini detail
    if (!GEMINI_KEY) { res.status(500).json({ error: "GEMINI_API_KEY belum diatur" }); return; }
    const recipeName = title || `resep dengan bahan ${ingredient || "umum"}`;
    const prompt = `Detail resep "${recipeName}" dalam bahasa Indonesia.
Balas HANYA JSON object:
{"id":${id},"title":"${recipeName}","readyInMinutes":30,"servings":2,"summary":"Deskripsi singkat 1 kalimat","instructions":"1. Langkah satu\\n2. Langkah dua\\n3. Langkah tiga\\n4. Langkah empat","extendedIngredients":[{"id":1,"name":"bahan","amount":200,"unit":"gram"}],"nutrition":{"nutrients":[{"name":"Calories","amount":300,"unit":"kcal","percentOfDailyNeeds":15},{"name":"Protein","amount":15,"unit":"g","percentOfDailyNeeds":30},{"name":"Carbohydrates","amount":40,"unit":"g","percentOfDailyNeeds":15},{"name":"Fat","amount":10,"unit":"g","percentOfDailyNeeds":13}]}}`;

    const raw = await callGemini(prompt);
    const parsed = extractJSON(raw);
    if (!parsed) { res.status(500).json({ error: "Format resep tidak valid" }); return; }
    res.json(parsed);
  } catch (err: any) {
    console.error("Recipe detail error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

router.get("/search", searchByIngredients);
router.get("/:id", getRecipeDetail);
export { router as recipeRoutes };
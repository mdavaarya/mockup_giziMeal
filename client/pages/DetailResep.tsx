import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { ArrowLeft, Clock, Users, Youtube } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserData, setUserData } from "@/lib/userStorage";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

interface RecipeDetail {
  id: number | string;
  title: string;
  image?: string;
  readyInMinutes: number;
  servings: number;
  summary?: string;
  instructions: string;
  ingredientList?: string[];           // dari MealDB/Gemini list
  extendedIngredients?: { id: number; name: string; amount: number; unit: string }[];
  youtubeUrl?: string;
  source?: string;
  nutrition?: { nutrients: { name: string; amount: number; unit: string; percentOfDailyNeeds?: number }[] };
}

function getNutrient(recipe: RecipeDetail, name: string) {
  return recipe.nutrition?.nutrients?.find((n) => n.name === name);
}

export default function DetailResep() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ✅ Ambil dari state dulu (sudah ada datanya, tidak perlu fetch)
  const passedData: RecipeDetail | null = location.state?.recipeData || null;
  const ingredient = location.state?.ingredient || "";

  const [recipe, setRecipe] = useState<RecipeDetail | null>(passedData);
  const [loading, setLoading] = useState(!passedData); // loading hanya jika tidak ada data
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Hanya fetch jika tidak ada data dari state
    if (passedData) return;

    const params = new URLSearchParams();
    if (ingredient) params.set("ingredient", ingredient);
    const source = id && Number(id) > 10000 ? "mealdb" : "gemini";
    params.set("source", source);

    fetch(`${API_BASE}/api/recipes/${id}?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => { setRecipe(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSaveToLog = () => {
    if (!recipe || !user?.id) return;
    const cal = getNutrient(recipe, "Calories");
    const prot = getNutrient(recipe, "Protein");

    const logs = getUserData<any[]>(user.id, "food_log", []);
    logs.push({
      foodName: recipe.title,
      calories: Math.round(cal?.amount || 0),
      protein: Math.round(prot?.amount || 0),
      mealType: "makan_siang",
      loggedAt: new Date().toISOString(),
    });
    setUserData(user.id, "food_log", logs);
    setSaved(true);
  };

  if (loading) return (
    <Layout>
      <div className="p-6">
        <p className="text-sm text-gray-500 text-center mb-4 animate-pulse">Memuat detail resep...</p>
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      </div>
    </Layout>
  );

  if (!recipe) return (
    <Layout><div className="p-6 text-center">
      <p className="text-gray-500 mb-4">Resep tidak ditemukan</p>
      <button onClick={() => navigate(-1)} className="text-black underline">Kembali</button>
    </div></Layout>
  );

  const calories = getNutrient(recipe, "Calories");
  const protein = getNutrient(recipe, "Protein");
  const carbs = getNutrient(recipe, "Carbohydrates");
  const fat = getNutrient(recipe, "Fat");

  // Parse langkah memasak
  const steps = recipe.instructions
    ? recipe.instructions.split(/\r?\n/).map((s) => s.replace(/^\d+\.\s*/, "").trim()).filter((s) => s.length > 5)
    : [];

  // Bahan-bahan: bisa dari ingredientList (string[]) atau extendedIngredients
  const ingredients: string[] = recipe.ingredientList ||
    recipe.extendedIngredients?.map((i) => `${i.unit} ${i.amount} ${i.name}`.trim()) || [];

  return (
    <Layout>
      {/* Hero */}
      <div className="relative h-52 bg-gray-900 flex items-center justify-center overflow-hidden">
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-8xl">🍳</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="font-syne font-bold text-white text-lg leading-tight">{recipe.title}</h1>
          <div className="flex gap-4 mt-1 text-white/80 text-sm">
            <span className="flex items-center gap-1"><Clock size={12} />{recipe.readyInMinutes} mnt</span>
            <span className="flex items-center gap-1"><Users size={12} />{recipe.servings} porsi</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 pb-28">
        {/* Deskripsi */}
        {recipe.summary && (
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">{recipe.summary}</p>
        )}

        {/* Nutrisi */}
        <h2 className="text-xs font-bold text-gray-500 tracking-widest mb-3">INFO GIZI PER PORSI</h2>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: "kkal", value: Math.round(calories?.amount || 0) },
            { label: "g protein", value: Math.round(protein?.amount || 0) },
            { label: "g karbo", value: Math.round(carbs?.amount || 0) },
            { label: "g lemak", value: Math.round(fat?.amount || 0) },
          ].map((n) => (
            <div key={n.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="font-syne font-bold text-lg text-black">{n.value}</p>
              <p className="text-xs text-gray-500">{n.label}</p>
            </div>
          ))}
        </div>

        {/* Bahan */}
        {ingredients.length > 0 && (
          <>
            <h2 className="text-xs font-bold text-gray-500 tracking-widest mb-3">BAHAN-BAHAN</h2>
            <div className="space-y-2 mb-6">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2 py-2 border-b border-gray-50">
                  <span className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0" />
                  <span className="text-sm text-black capitalize">{ing}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Langkah */}
        {steps.length > 0 && (
          <>
            <h2 className="text-xs font-bold text-gray-500 tracking-widest mb-3">LANGKAH MEMASAK</h2>
            <div className="space-y-4 mb-6">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* YouTube link jika ada */}
        {recipe.youtubeUrl && (
          <a href={recipe.youtubeUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-red-600 text-sm mb-6 hover:underline">
            <Youtube size={16} />
            Tonton Video Tutorial
          </a>
        )}

        <button onClick={handleSaveToLog} disabled={saved}
          className="w-full bg-black text-white font-syne font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60">
          {saved ? "✓ Tersimpan ke Catatan Harian" : "Simpan ke Catatan Harian →"}
        </button>
      </div>
    </Layout>
  );
}
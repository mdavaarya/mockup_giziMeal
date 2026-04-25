import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Clock, Users, ArrowLeft } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

interface Recipe {
  id: number | string;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  instructions?: string;
  ingredientList?: string[];
  source?: string;
  nutrition?: { nutrients: { name: string; amount: number; unit: string }[] };
}

function getNutrient(recipe: Recipe, name: string) {
  return recipe.nutrition?.nutrients?.find((n) => n.name === name)?.amount || 0;
}

const FOOD_EMOJIS: Record<string, string> = {
  banana: "🍌", beef: "🥩", chicken: "🍗", broccoli: "🥦", avocado: "🥑",
  fish: "🐟", salmon: "🐟", egg: "🥚", rice: "🍚", tofu: "🫘",
  tomato: "🍅", potato: "🥔", apple: "🍎", mango: "🥭",
};
function getFoodEmoji(ingredient: string) {
  const lower = ingredient?.toLowerCase() || "";
  for (const [key, emoji] of Object.entries(FOOD_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return "🍽️";
}

export default function Recipes() {
  const location = useLocation();
  const navigate = useNavigate();
  const ingredient = location.state?.ingredient || "";
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ingredient) { setLoading(false); return; }
    fetch(`${API_BASE}/api/recipes/search?ingredients=${encodeURIComponent(ingredient)}&number=4`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRecipes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((e) => { setError(e.message || "Gagal memuat resep"); setLoading(false); });
  }, [ingredient]);

  const handleOpenDetail = (recipe: Recipe) => {
    // Pass FULL recipe data via state supaya detail page tidak perlu fetch ulang
    navigate(`/recipe/${recipe.id}`, {
      state: { recipeData: recipe, ingredient },
    });
  };

  return (
    <Layout>
      <div className="px-6 py-6 pb-24">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-black">
          <ArrowLeft size={20} /><span className="text-sm">Kembali</span>
        </button>

        <div className="inline-block bg-black text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
          Rekomendasi Resep
        </div>
        <h1 className="font-syne font-bold text-xl text-black mb-1">
          {ingredient ? `Bisa dibuat dari ${ingredient}` : "Semua Resep"}
        </h1>
        <p className="text-xs text-gray-400 mb-6">
          Resep dari TheMealDB · Gemini AI sebagai fallback
        </p>

        {loading && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center mb-2 animate-pulse">Mencari resep...</p>
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">😕</p>
            <p className="text-sm">{error}</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-black underline text-sm">Kembali</button>
          </div>
        )}

        {!loading && !error && recipes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">🔍</p>
            <p>Tidak ada resep ditemukan</p>
            <p className="text-sm mt-2">Coba scan bahan lain</p>
          </div>
        )}

        <div className="space-y-4">
          {recipes.map((recipe) => (
            <button key={recipe.id} onClick={() => handleOpenDetail(recipe)}
              className="w-full flex gap-4 border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white text-left">
              {recipe.image ? (
                <img src={recipe.image} alt={recipe.title}
                  className="w-24 h-24 object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-4xl flex-shrink-0">
                  {getFoodEmoji(ingredient)}
                </div>
              )}
              <div className="flex-1 py-3 pr-3">
                <h3 className="font-syne font-bold text-sm text-black mb-1 line-clamp-2">{recipe.title}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  {recipe.readyInMinutes && <span className="flex items-center gap-1"><Clock size={10} />{recipe.readyInMinutes} mnt</span>}
                  {recipe.servings && <span className="flex items-center gap-1"><Users size={10} />{recipe.servings} porsi</span>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                    {Math.round(getNutrient(recipe, "Calories"))} kkal
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {Math.round(getNutrient(recipe, "Protein"))}g protein
                  </span>
                  {recipe.source === "mealdb" && (
                    <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">MealDB</span>
                  )}
                  {recipe.source === "gemini" && (
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">AI</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
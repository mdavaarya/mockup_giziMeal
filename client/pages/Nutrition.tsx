import { useLocation, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { ArrowLeft } from "lucide-react";

interface NutritionData {
  ingredient: string;
  confidence: number;
  imagePreview?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
}

const DAILY_NEEDS = { calories: 2000, protein: 50, carbs: 275, fat: 78 };

export default function Nutrition() {
  const location = useLocation();
  const navigate = useNavigate();
  const data: NutritionData = location.state?.nutritionData || {
    ingredient: "Ayam Mentah",
    confidence: 97,
    nutrition: { calories: 215, protein: 27, carbs: 0, fat: 12, fiber: 0 },
  };

  const pct = (val: number, daily: number) => Math.min(Math.round((val / daily) * 100), 100);

  const bars = [
    { label: "Protein", value: data.nutrition.protein, daily: DAILY_NEEDS.protein, unit: "g" },
    { label: "Karbohidrat", value: data.nutrition.carbs, daily: DAILY_NEEDS.carbs, unit: "g" },
    { label: "Lemak", value: data.nutrition.fat, daily: DAILY_NEEDS.fat, unit: "g" },
  ];

  return (
    <Layout>
      <div className="px-6 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-black">
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali</span>
        </button>

        <div className="inline-block bg-black text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
          Hasil Scan
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
            🥩
          </div>
          <div>
            <h1 className="font-syne font-bold text-xl text-black">{data.ingredient}</h1>
            <p className="text-sm text-gray-500">Terdeteksi • {data.confidence}% akurasi</p>
          </div>
        </div>

        <h2 className="text-xs font-bold text-gray-500 tracking-widest mb-3">KANDUNGAN GIZI / 100g</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "kkal", value: data.nutrition.calories },
            { label: "g protein", value: data.nutrition.protein },
            { label: "g karbohidrat", value: data.nutrition.carbs },
            { label: "g lemak", value: data.nutrition.fat },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-4">
              <p className="font-syne font-bold text-2xl text-black">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xs font-bold text-gray-500 tracking-widest mb-3">% KEBUTUHAN HARIAN</h2>
        <div className="space-y-3 mb-8">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{bar.label}</span>
                <span className="font-bold text-black">{pct(bar.value, bar.daily)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-black rounded-full transition-all" style={{ width: `${pct(bar.value, bar.daily)}%` }} />
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/recipes"
          state={{ ingredient: data.ingredient.replace(/_/g, " ") }}
          className="block w-full bg-black text-white font-syne font-bold py-4 rounded-xl text-center hover:bg-gray-800 transition-colors"
        >
          Lihat Resep dari Bahan Ini →
        </Link>
      </div>
    </Layout>
  );
}

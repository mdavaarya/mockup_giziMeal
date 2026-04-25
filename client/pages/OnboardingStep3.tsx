import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function OnboardingStep3() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile } = useAuth();

  // Get data from previous steps via location state or localStorage
  const step1 = location.state?.step1 || JSON.parse(localStorage.getItem("onboarding_step1") || "{}");
  const step2 = location.state?.step2 || JSON.parse(localStorage.getItem("onboarding_step2") || "{}");

  // Calculate calories using Mifflin-St Jeor
  const w = Number(step1.weight) || 70;
  const h = Number(step1.height) || 170;
  const a = Number(step1.age) || 25;
  const g = step1.gender || "male";
  const goal = step2.goal || "maintain";

  let bmr = g === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  let tdee = bmr * 1.375;
  if (goal === "lose") tdee -= 500;
  if (goal === "gain") tdee += 500;

  const calories = Math.round(tdee);
  const protein = Math.round((calories * 0.3) / 4);
  const carbs = Math.round((calories * 0.45) / 4);
  const fat = Math.round((calories * 0.25) / 9);

  const handleStart = async () => {
    updateProfile({ ...step1, goal, calories, protein, carbs, fat });
    // Save to backend (non-blocking)
    if (user?.id) {
      fetch(`${API_BASE}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...step1, goal, name: user.name }),
      }).catch(() => {});
    }
    localStorage.removeItem("onboarding_step1");
    localStorage.removeItem("onboarding_step2");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-8">
      <div className="mb-8">
        <div className="flex gap-2">
          <div className="flex-1 h-1 bg-black rounded-full" />
          <div className="flex-1 h-1 bg-black rounded-full" />
          <div className="flex-1 h-1 bg-black rounded-full" />
        </div>
        <p className="text-xs text-gray-500 mt-2">Langkah 3 dari 3</p>
      </div>

      <h1 className="font-syne font-bold text-2xl text-black mb-4">Kebutuhan Kalori Kamu</h1>
      <p className="text-gray-500 text-sm mb-10">Berdasarkan data tubuh dan tujuanmu</p>

      <div className="flex-1 flex items-center justify-center mb-8">
        <div className="relative w-52 h-52">
          <svg className="absolute inset-0" viewBox="0 0 200 200" width="200" height="200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#f0f0f0" strokeWidth="10" />
            <circle cx="100" cy="100" r="90" fill="none" stroke="#000" strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 90} 0`}
              strokeLinecap="round" transform="rotate(-90 100 100)" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-syne font-bold text-4xl text-black">{calories}</span>
            <span className="text-gray-500 text-sm">kkal/hari</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: "Protein", value: `${protein}g` },
          { label: "Karbo", value: `${carbs}g` },
          { label: "Lemak", value: `${fat}g` },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-xs mb-2">{item.label}</p>
            <p className="font-syne font-bold text-xl text-black">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-8 text-sm text-gray-500 text-center">
        Target ini dihitung menggunakan formula BMR Mifflin-St Jeor
      </div>

      <button
        onClick={handleStart}
        className="w-full bg-black text-white font-syne font-bold py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors"
      >
        Mulai GiziMeal 🎉
      </button>
    </div>
  );
}

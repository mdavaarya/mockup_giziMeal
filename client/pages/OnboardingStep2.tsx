import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GOALS = [
  { id: "lose", emoji: "⬇️", title: "Menurunkan Berat Badan", desc: "Defisit kalori 500 kkal/hari" },
  { id: "maintain", emoji: "⚖️", title: "Menjaga Berat Badan", desc: "Kalori sesuai kebutuhan" },
  { id: "gain", emoji: "⬆️", title: "Menaikkan Berat Badan", desc: "Surplus kalori 500 kkal/hari" },
];

export default function OnboardingStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [goal, setGoal] = useState("");

  const handleNext = () => {
    if (!goal) return;
    const step2 = { goal };
    localStorage.setItem("onboarding_step2", JSON.stringify(step2));
    navigate("/onboarding-3", { state: { step1: location.state?.step1, step2 } });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-8">
      <div className="mb-8">
        <div className="flex gap-2">
          <div className="flex-1 h-1 bg-black rounded-full" />
          <div className="flex-1 h-1 bg-black rounded-full" />
          <div className="flex-1 h-1 bg-gray-200 rounded-full" />
        </div>
        <p className="text-xs text-gray-500 mt-2">Langkah 2 dari 3</p>
      </div>

      <h1 className="font-syne font-bold text-2xl text-black mb-2">Apa Tujuanmu?</h1>
      <p className="text-gray-500 text-sm mb-8">Pilih sesuai target kesehatanmu</p>

      <div className="flex-1 flex flex-col gap-4">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGoal(g.id)}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
              goal === g.id ? "border-black bg-black text-white" : "border-gray-200 bg-white text-black hover:border-gray-400"
            }`}
          >
            <span className="text-3xl">{g.emoji}</span>
            <div>
              <p className="font-syne font-bold text-base">{g.title}</p>
              <p className={`text-sm mt-1 ${goal === g.id ? "text-gray-300" : "text-gray-500"}`}>{g.desc}</p>
            </div>
            {goal === g.id && (
              <div className="ml-auto w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={!goal}
        className="w-full bg-black text-white font-syne font-bold py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors mt-8 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Lanjut →
      </button>
    </div>
  );
}

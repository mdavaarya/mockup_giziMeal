import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OnboardingStep1() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ weight: "", height: "", age: "", gender: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleNext = () => {
    if (!formData.weight || !formData.height || !formData.age || !formData.gender) return;
    localStorage.setItem("onboarding_step1", JSON.stringify(formData));
    navigate("/onboarding-2", { state: { step1: formData } });
  };

  const isValid = formData.weight && formData.height && formData.age && formData.gender;

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-8">
      <div className="mb-8">
        <div className="flex gap-2">
          <div className="flex-1 h-1 bg-black rounded-full" />
          <div className="flex-1 h-1 bg-gray-200 rounded-full" />
          <div className="flex-1 h-1 bg-gray-200 rounded-full" />
        </div>
        <p className="text-xs text-gray-500 mt-2">Langkah 1 dari 3</p>
      </div>

      <h1 className="font-syne font-bold text-2xl text-black mb-2">Kenali Tubuhmu</h1>
      <p className="text-gray-500 text-sm mb-8">Data ini digunakan untuk menghitung kebutuhan gizimu</p>

      <div className="flex-1 flex flex-col gap-4">
        {[
          { label: "Berat Badan (kg)", name: "weight", placeholder: "Contoh: 65" },
          { label: "Tinggi Badan (cm)", name: "height", placeholder: "Contoh: 170" },
          { label: "Umur (tahun)", name: "age", placeholder: "Contoh: 22" },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-sm text-gray-600 mb-2">{f.label}</label>
            <input
              type="number" name={f.name} placeholder={f.placeholder}
              value={(formData as any)[f.name]} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm text-gray-600 mb-3">Jenis Kelamin</label>
          <div className="flex gap-3">
            {[{ val: "male", label: "Laki-laki" }, { val: "female", label: "Perempuan" }].map((g) => (
              <button
                key={g.val}
                onClick={() => setFormData((p) => ({ ...p, gender: g.val }))}
                className={`flex-1 py-3 px-4 rounded-xl font-syne font-bold transition-colors border-2 ${
                  formData.gender === g.val ? "bg-black text-white border-black" : "bg-white text-black border-gray-200"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!isValid}
        className="w-full bg-black text-white font-syne font-bold py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors mt-8 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Lanjut →
      </button>
    </div>
  );
}

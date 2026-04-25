import { useState } from "react";
import { Plus, Trash2, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { getUserData, setUserData } from "@/lib/userStorage";

interface FoodLogItem {
  foodName: string;
  calories: number;
  protein: number;
  mealType: string;
  loggedAt: string;
}

const MEAL_TYPES: Record<string, string> = {
  sarapan: "Sarapan",
  makan_siang: "Makan Siang",
  makan_malam: "Makan Malam",
  camilan: "Camilan",
};

export default function FoodLog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date();
  const todayStr = today.toDateString();

  const targetCalories = user?.calories || 2000;
  const targetProtein = user?.protein || 50;
  const targetCarbs = user?.carbs || 275;
  const targetFat = user?.fat || 78;

  const [allLogs, setAllLogs] = useState<FoodLogItem[]>(() => {
    if (!user?.id) return [];
    const logs = getUserData<FoodLogItem[]>(user.id, "food_log", []);
    const pending: Omit<FoodLogItem, "loggedAt">[] = JSON.parse(
      localStorage.getItem("pending_foodlog") || "[]"
    );
    if (pending.length > 0) {
      const newLogs = pending.map((p) => ({ ...p, loggedAt: new Date().toISOString() }));
      const merged = [...logs, ...newLogs];
      setUserData(user.id, "food_log", merged);
      localStorage.removeItem("pending_foodlog");
      return merged;
    }
    return logs;
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    foodName: "",
    calories: "",
    protein: "",
    mealType: "makan_siang",
  });

  const todayLogs = allLogs.filter(
    (l) => new Date(l.loggedAt).toDateString() === todayStr
  );
  const currentCalories = todayLogs.reduce((s, l) => s + (l.calories || 0), 0);
  const currentProtein = todayLogs.reduce((s, l) => s + (l.protein || 0), 0);
  const intakePct = Math.min((currentCalories / targetCalories) * 100, 100);

  const handleAdd = () => {
    if (!user?.id || !form.foodName || !form.calories) return;
    const newItem: FoodLogItem = {
      foodName: form.foodName,
      calories: Number(form.calories),
      protein: Number(form.protein) || 0,
      mealType: form.mealType,
      loggedAt: new Date().toISOString(),
    };
    const updated = [...allLogs, newItem];
    setUserData(user.id, "food_log", updated);
    setAllLogs(updated);
    setForm({ foodName: "", calories: "", protein: "", mealType: "makan_siang" });
    setShowModal(false);
  };

  const handleDelete = (todayIdx: number) => {
    if (!user?.id) return;
    let count = -1;
    const globalIdx = allLogs.findIndex((l) => {
      if (new Date(l.loggedAt).toDateString() === todayStr) count++;
      return count === todayIdx;
    });
    if (globalIdx === -1) return;
    const updated = allLogs.filter((_, i) => i !== globalIdx);
    setUserData(user.id, "food_log", updated);
    setAllLogs(updated);
  };

  const grouped: Record<string, FoodLogItem[]> = {};
  todayLogs.forEach((log) => {
    const key = log.mealType || "makan_siang";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  });

  const metrics = [
    { label: "Protein", current: currentProtein, target: targetProtein, unit: "g" },
    { label: "Karbo", current: 0, target: targetCarbs, unit: "g" },
    { label: "Lemak", current: 0, target: targetFat, unit: "g" },
  ];

  return (
    <Layout>
      <div className="px-6 py-6 pb-32">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 mb-4 hover:text-black"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali</span>
        </button>

        <h1 className="font-syne font-bold text-2xl text-black mb-1">Log Harian</h1>
        <p className="text-gray-600 text-sm mb-8">
          {today.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* Calorie Ring */}
        <div className="mb-10 flex flex-col items-center">
          <div className="relative w-40 h-40 mb-4">
            <svg className="absolute inset-0" viewBox="0 0 200 200" width="200" height="200">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#f0f0f0" strokeWidth="8" />
              <circle
                cx="100" cy="100" r="80" fill="none" stroke="#000000" strokeWidth="8"
                strokeDasharray={`${(intakePct / 100) * (2 * Math.PI * 80)} ${(2 * Math.PI * 80) * ((100 - intakePct) / 100)}`}
                strokeLinecap="round" transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-syne font-bold text-3xl text-black">{Math.round(intakePct)}%</span>
              <span className="text-xs text-gray-600">{currentCalories} / {targetCalories}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Sisa kalori: {Math.max(0, targetCalories - currentCalories)} kkal
          </p>
        </div>

        {/* Macro bars */}
        <div className="space-y-4 mb-10">
          {metrics.map((m) => {
            const pct = m.current > 0 ? Math.min((m.current / m.target) * 100, 100) : 0;
            return (
              <div key={m.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-black">{m.label}</span>
                  <span className="text-xs text-gray-600">{m.current} / {m.target} {m.unit}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-black transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Food List */}
        {todayLogs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-3xl mb-3">🍽️</p>
            <p className="font-syne font-bold text-black mb-1">Belum ada catatan hari ini</p>
            <p className="text-sm text-gray-500">Tekan tombol + untuk menambahkan makanan</p>
          </div>
        ) : (
          Object.entries(MEAL_TYPES).map(([key, label]) => {
            const items = grouped[key];
            if (!items || items.length === 0) return null;
            let groupStart = 0;
            todayLogs.forEach((l, i) => {
              if ((l.mealType || "makan_siang") === key && i < groupStart) groupStart = i;
            });
            return (
              <div key={key} className="mb-6">
                <h3 className="font-syne font-bold text-lg text-black mb-3">{label}</h3>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-100 rounded-xl">
                      <div>
                        <p className="text-black text-sm font-medium">{item.foodName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.protein}g protein</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{item.calories} kkal</span>
                        <button
                          onClick={() => {
                            const todayOnlyIdx = todayLogs.indexOf(item);
                            handleDelete(todayOnlyIdx);
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg z-10"
      >
        <Plus size={28} />
      </button>

      {/* Add Food Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 pb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-syne font-bold text-lg text-black">Tambah Makanan</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nama Makanan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Nasi Putih"
                  value={form.foodName}
                  onChange={(e) => setForm((p) => ({ ...p, foodName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Kalori (kkal) *</label>
                  <input
                    type="number"
                    placeholder="Contoh: 206"
                    value={form.calories}
                    onChange={(e) => setForm((p) => ({ ...p, calories: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 4"
                    value={form.protein}
                    onChange={(e) => setForm((p) => ({ ...p, protein: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Waktu Makan</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(MEAL_TYPES).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setForm((p) => ({ ...p, mealType: key }))}
                      className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                        form.mealType === key
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!form.foodName || !form.calories}
                className="w-full bg-black text-white font-syne font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 mt-2"
              >
                Tambah ke Log
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
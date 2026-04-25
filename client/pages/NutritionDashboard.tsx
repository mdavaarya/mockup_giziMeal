import { AlertCircle, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { getUserData } from "@/lib/userStorage";

interface FoodLogItem {
  foodName: string;
  calories: number;
  protein: number;
  mealType: string;
  loggedAt: string;
}

function getDayLabel(dateStr: string) {
  return ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][new Date(dateStr).getDay()];
}

export default function NutritionDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const targetCalories = user?.calories || 2000;
  const targetProtein = user?.protein || 50;

  const foodLogs: FoodLogItem[] = user?.id ? getUserData<FoodLogItem[]>(user.id, "food_log", []) : [];

  const today = new Date();
  const weeklyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    weeklyMap[d.toDateString()] = 0;
  }
  foodLogs.forEach((log) => {
    const dateKey = new Date(log.loggedAt).toDateString();
    if (dateKey in weeklyMap) weeklyMap[dateKey] += log.calories || 0;
  });

  const weeklyData = Object.entries(weeklyMap).map(([dateStr, intake]) => ({ day: getDayLabel(dateStr), intake, target: targetCalories }));
  const maxIntake = Math.max(...weeklyData.map((d) => d.intake), targetCalories, 100);
  const chartHeight = 160;

  const todayLogs = foodLogs.filter((l) => new Date(l.loggedAt).toDateString() === today.toDateString());
  const todayCalories = todayLogs.reduce((s, l) => s + (l.calories || 0), 0);
  const todayProtein = todayLogs.reduce((s, l) => s + (l.protein || 0), 0);
  const calPct = Math.round((todayCalories / targetCalories) * 100);
  const proteinPct = Math.round((todayProtein / targetProtein) * 100);
  const daysAchieved = weeklyData.filter((d) => d.intake >= d.target * 0.8 && d.intake > 0).length;
  const hasData = foodLogs.length > 0;

  const statusCards = [
    { label: proteinPct < 80 ? "Protein Masih Kurang" : "Protein Tercukupi", status: proteinPct < 80 ? "warning" : "success", icon: proteinPct < 80 ? AlertCircle : Check, value: `${proteinPct}%` },
    { label: "Kalori Tercapai", status: daysAchieved >= 3 ? "success" : "warning", icon: daysAchieved >= 3 ? Check : AlertCircle, value: `${daysAchieved}/7 hari` },
    { label: calPct > 110 ? "Kalori Berlebih" : "Kalori Hari Ini", status: calPct > 110 ? "warning" : "success", icon: calPct > 110 ? AlertCircle : Check, value: `${calPct}%` },
  ];

  return (
    <Layout>
      <div className="px-6 py-6 pb-24">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-black">
          <ArrowLeft size={20} /><span className="text-sm">Kembali</span>
        </button>
        <h1 className="font-syne font-bold text-2xl text-black mb-8">Ringkasan Minggu Ini</h1>

        {!hasData ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl mb-8">
            <p className="text-4xl mb-4">📊</p>
            <p className="font-syne font-bold text-black mb-2">Belum ada data</p>
            <p className="text-sm text-gray-500">Tambahkan makanan ke catatan harian untuk melihat dashboard</p>
          </div>
        ) : (
          <>
            <div className="bg-gray-100 rounded-xl p-6 mb-8">
              <div className="flex items-end gap-2 justify-center mb-4" style={{ height: `${chartHeight + 20}px` }}>
                {weeklyData.map((data, idx) => {
                  const barH = data.intake > 0 ? Math.max((data.intake / maxIntake) * chartHeight, 4) : 0;
                  return (
                    <div key={idx} className="flex flex-col items-center justify-end" style={{ height: `${chartHeight + 20}px` }}>
                      <div className="flex flex-col items-center justify-end" style={{ height: `${chartHeight}px` }}>
                        <div className={`w-8 rounded-t-lg ${data.intake === 0 ? "bg-gray-200" : data.intake > data.target ? "bg-black" : "bg-gray-500"}`} style={{ height: `${barH}px` }} />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{data.day}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 justify-center text-xs text-gray-600">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-black rounded-sm" /><span>Melebihi Target</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-500 rounded-sm" /><span>Di Bawah Target</span></div>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              {statusCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className={`${card.status === "success" ? "bg-green-50" : "bg-yellow-50"} rounded-lg p-4 flex items-center gap-4`}>
                    <div className={`p-2 ${card.status === "success" ? "text-green-600" : "text-yellow-600"}`}><Icon size={24} /></div>
                    <div className="flex-1">
                      <p className="font-semibold text-black text-sm">{card.label}</p>
                      <p className="text-xs text-gray-600">{card.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="bg-black text-white rounded-lg p-6 text-center">
          <p className="font-syne font-bold mb-2">{hasData ? "Terus Semangat! 💪" : "Mulai Perjalananmu! 🚀"}</p>
          <p className="text-sm text-gray-300">{hasData ? `Sudah mencatat ${foodLogs.length} makanan. Konsistensi adalah kunci!` : "Catat makananmu setiap hari untuk memantau perkembangan gizi."}</p>
        </div>
      </div>
    </Layout>
  );
}
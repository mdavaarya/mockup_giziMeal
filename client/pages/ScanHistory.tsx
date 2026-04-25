import { useState } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { getUserData } from "@/lib/userStorage";

interface ScanItem {
  ingredient: string;
  confidence: number;
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
  scannedAt: string;
}

function timeAgo(dateStr: string) {
  const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return `${Math.floor(diffHour / 24)} hari lalu`;
}

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function isThisWeek(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24) <= 7;
}

export default function ScanHistory() {
  const [activeFilter, setActiveFilter] = useState("semua");
  const navigate = useNavigate();
  const { user } = useAuth();

  const allScans: ScanItem[] = user?.id
    ? getUserData<ScanItem[]>(user.id, "recent_scans", [])
    : [];

  const filteredScans =
    activeFilter === "semua" ? allScans :
    activeFilter === "hari-ini" ? allScans.filter((s) => isToday(s.scannedAt)) :
    allScans.filter((s) => isThisWeek(s.scannedAt));

  const filters = [
    { id: "semua", label: "Semua" },
    { id: "hari-ini", label: "Hari Ini" },
    { id: "minggu-ini", label: "Minggu Ini" },
  ];

  return (
    <Layout>
      <div className="px-6 py-6 pb-24">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-black">
          <ArrowLeft size={20} /><span className="text-sm">Kembali</span>
        </button>

        <h1 className="font-syne font-bold text-2xl text-black mb-6">Riwayat Scan</h1>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                activeFilter === f.id ? "bg-black text-white" : "bg-gray-200 text-black hover:bg-gray-300"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {filteredScans.length > 0 ? (
          <div className="space-y-4">
            {filteredScans.map((scan, idx) => (
              <button key={idx} onClick={() => navigate("/nutrition", { state: { nutritionData: scan } })}
                className="w-full flex items-center gap-4 p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-left">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🥩</div>
                <div className="flex-1">
                  <h3 className="font-syne font-bold text-black text-sm capitalize">{scan.ingredient.replace(/_/g, " ")}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{scan.scannedAt ? timeAgo(scan.scannedAt) : ""}</p>
                  <p className="text-xs text-gray-600 mt-1">{scan.nutrition?.calories} kkal • {scan.nutrition?.protein}g protein</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="font-syne font-bold text-lg text-black mb-2">Belum ada riwayat scan</h3>
            <p className="text-center text-gray-600 text-sm">Mulai scan bahan makanan untuk melihat riwayat di sini</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
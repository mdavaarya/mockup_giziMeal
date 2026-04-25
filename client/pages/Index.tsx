import { Link } from "react-router-dom";
import { Camera } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { getUserData } from "@/lib/userStorage";

export default function Beranda() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Kamu";

  const recentScans = user?.id
    ? getUserData<any[]>(user.id, "recent_scans", []).slice(0, 3)
    : [];

  return (
    <Layout>
      <header className="bg-black text-white px-6 py-8">
        <p className="text-gray-400 text-xs mb-1">SELAMAT DATANG</p>
        <h1 className="font-syne font-bold text-2xl">Halo, {firstName}! 👋</h1>
        {user?.calories && (
          <p className="text-gray-400 text-sm mt-1">Target harian: {user.calories} kkal</p>
        )}
      </header>

      <div className="px-6 py-6">
        <div className="bg-black rounded-2xl p-8 text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 rounded-full p-5">
              <Camera size={40} className="text-white" strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="font-syne font-bold text-white text-lg mb-2">Foto Bahan Kamu</h2>
          <p className="text-gray-400 text-sm mb-6">Arahkan kamera ke bahan mentah untuk analisis gizi</p>
          <Link to="/scan"
            className="inline-block w-full bg-white text-black font-syne font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors">
            Buka Kamera →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link to="/food-log" className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
            <p className="text-xl mb-2">📋</p>
            <p className="font-syne font-bold text-sm text-black">Catatan Harian</p>
            <p className="text-xs text-gray-500 mt-1">Log makanan hari ini</p>
          </Link>
          <Link to="/nutrition-dashboard" className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
            <p className="text-xl mb-2">📊</p>
            <p className="font-syne font-bold text-sm text-black">Dashboard Gizi</p>
            <p className="text-xs text-gray-500 mt-1">Pantau minggu ini</p>
          </Link>
        </div>

        <h3 className="font-syne font-bold text-lg text-black mb-4">Scan Terakhir</h3>
        {recentScans.length > 0 ? (
          <div className="space-y-3">
            {recentScans.map((scan: any, i: number) => (
              <Link key={i} to="/nutrition" state={{ nutritionData: scan }}
                className="flex items-center gap-4 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="text-2xl">🥩</div>
                <div className="flex-1">
                  <h4 className="font-syne font-bold text-black text-sm capitalize">{scan.ingredient?.replace(/_/g, " ")}</h4>
                  <p className="text-xs text-gray-500">{scan.nutrition?.calories} kkal • {scan.nutrition?.protein}g protein</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-3xl mb-2">📷</p>
            <p className="text-gray-500 text-sm">Belum ada scan. Mulai foto bahan makananmu!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
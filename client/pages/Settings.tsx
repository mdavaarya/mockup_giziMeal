import { Bell, Globe, Info, ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClearData = () => {
    if (!user?.id) return;
    if (confirm("Hapus semua data lokal kamu? (riwayat scan & catatan makanan)")) {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(`user_${user.id}_`));
      keys.forEach((k) => localStorage.removeItem(k));
      alert("Data berhasil dihapus.");
    }
  };

  const menus = [
    { icon: Bell, label: "Notifikasi", desc: "Atur pengingat makan harian" },
    { icon: Globe, label: "Bahasa", desc: "Indonesia" },
    { icon: Info, label: "Tentang Aplikasi", desc: "GiziMeal v2.0" },
  ];

  return (
    <Layout>
      <div className="px-6 py-6 pb-24">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-black">
          <ArrowLeft size={20} /><span className="text-sm">Kembali</span>
        </button>

        <h1 className="font-syne font-bold text-2xl text-black mb-8">Pengaturan</h1>

        <div className="bg-gray-100 rounded-xl overflow-hidden mb-6">
          {menus.map((menu, idx) => {
            const Icon = menu.icon;
            return (
              <button key={menu.label}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-200 transition-colors ${idx < menus.length - 1 ? "border-b border-gray-300" : ""}`}>
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-black" />
                  <div className="text-left">
                    <p className="font-semibold text-black text-sm">{menu.label}</p>
                    <p className="text-xs text-gray-500">{menu.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-red-50 rounded-xl overflow-hidden">
          <button onClick={handleClearData}
            className="w-full flex items-center gap-3 p-4 hover:bg-red-100 transition-colors">
            <Trash2 size={20} className="text-red-500" />
            <div className="text-left">
              <p className="font-semibold text-red-600 text-sm">Hapus Data Lokal</p>
              <p className="text-xs text-red-400">Hapus riwayat scan & catatan makanan</p>
            </div>
          </button>
        </div>
      </div>
    </Layout>
  );
}
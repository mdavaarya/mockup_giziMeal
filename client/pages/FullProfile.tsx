import { Bell, Globe, Info, LogOut, Edit2, ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

export default function FullProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "GM";

  const goalLabel =
    user?.goal === "lose"
      ? "Menurunkan Berat Badan"
      : user?.goal === "gain"
        ? "Menaikkan Berat Badan"
        : "Menjaga Berat Badan";

  // Calculate BMI if data available
  const bmi =
    user?.weight && user?.height
      ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1)
      : null;

  const settingsMenus = [
    { id: "notif", label: "Notifikasi", icon: Bell },
    { id: "lang", label: "Bahasa", icon: Globe },
    { id: "about", label: "Tentang Aplikasi", icon: Info },
  ];

  return (
    <Layout>
      <div className="px-6 py-6 pb-24">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:text-black"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali</span>
        </button>

        {/* User Profile Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center font-syne font-bold text-2xl">
              {initials}
            </div>
          </div>
          <h1 className="font-syne font-bold text-2xl text-black mb-1">
            {user?.name || "Pengguna"}
          </h1>
          <p className="text-gray-600 text-sm">{user?.email}</p>
        </div>

        {/* Data Tubuh Card */}
        <div className="bg-gray-100 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-syne font-bold text-lg text-black">Data Tubuh</h2>
            <button
              onClick={() => navigate("/onboarding-1")}
              className="text-black text-sm hover:underline flex items-center gap-1"
            >
              <Edit2 size={16} />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Berat Badan</p>
              <p className="font-syne font-bold text-black">
                {user?.weight ? `${user.weight} kg` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Tinggi Badan</p>
              <p className="font-syne font-bold text-black">
                {user?.height ? `${user.height} cm` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Umur</p>
              <p className="font-syne font-bold text-black">
                {user?.age ? `${user.age} tahun` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">BMI</p>
              <p className="font-syne font-bold text-black">{bmi || "-"}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-600 mb-1">Tujuan Diet</p>
            <p className="font-syne font-bold text-black">{goalLabel}</p>
          </div>
        </div>

        {/* Target Harian Card */}
        {user?.calories && (
          <div className="bg-gray-100 rounded-xl p-6 mb-8">
            <h2 className="font-syne font-bold text-lg text-black mb-4">Target Harian</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Kalori", value: `${user.calories} kkal` },
                { label: "Protein", value: `${user.protein}g` },
                { label: "Karbo", value: `${user.carbs}g` },
                { label: "Lemak", value: `${user.fat}g` },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">{item.label}</p>
                  <p className="font-syne font-bold text-black">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Menu */}
        <div className="bg-gray-100 rounded-xl overflow-hidden mb-8">
          {settingsMenus.map((menu, idx) => {
            const Icon = menu.icon;
            return (
              <button
                key={menu.id}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-200 transition-colors ${
                  idx < settingsMenus.length - 1 ? "border-b border-gray-300" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-black" />
                  <span className="font-semibold text-black">{menu.label}</span>
                </div>
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 border-2 border-black text-black font-syne font-bold rounded-lg hover:bg-gray-100 transition-colors"
        >
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </Layout>
  );
}
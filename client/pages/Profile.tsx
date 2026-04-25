import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { ChevronRight, LogOut, User, BarChart2, Clock, Settings } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "GM";

  return (
    <Layout>
      <div className="px-6 py-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-3">
            <span className="font-syne font-bold text-white text-2xl">{initials}</span>
          </div>
          <h1 className="font-syne font-bold text-xl text-black">{user?.name || "Pengguna"}</h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>

        {user?.calories && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Target Kalori", value: `${user.calories} kkal` },
              { label: "Protein", value: `${user.protein}g` },
              { label: "Tujuan", value: user.goal === "lose" ? "Diet" : user.goal === "gain" ? "Bulking" : "Maintain" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="font-syne font-bold text-sm text-black">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {[
            { icon: User, label: "Data Lengkap Saya", to: "/full-profile" },
            { icon: BarChart2, label: "Dashboard Nutrisi", to: "/nutrition-dashboard" },
            { icon: Clock, label: "Riwayat Scan", to: "/scan-history" },
            { icon: Settings, label: "Pengaturan", to: "/settings" },
          ].map((item) => (
            <Link key={item.label} to={item.to}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <item.icon size={20} className="text-black" />
              <span className="flex-1 font-medium text-black text-sm">{item.label}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          ))}
        </div>

        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 mt-6 p-4 border border-gray-200 rounded-xl text-red-500 hover:bg-red-50 transition-colors">
          <LogOut size={18} />
          <span className="font-medium text-sm">Keluar</span>
        </button>
      </div>
    </Layout>
  );
}
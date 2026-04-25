import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Camera, MessageCircle, User } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 pb-20 overflow-y-auto">{children}</div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around items-center">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors ${
            isActive("/")
              ? "bg-black text-white"
              : "text-gray-600 hover:text-black"
          }`}
          title="Beranda"
        >
          <Home size={24} strokeWidth={1.5} />
        </Link>

        <Link
          to="/scan"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors ${
            isActive("/scan")
              ? "bg-black text-white"
              : "text-gray-600 hover:text-black"
          }`}
          title="Scan"
        >
          <Camera size={24} strokeWidth={1.5} />
        </Link>

        <Link
          to="/chat"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors ${
            isActive("/chat")
              ? "bg-black text-white"
              : "text-gray-600 hover:text-black"
          }`}
          title="Chat"
        >
          <MessageCircle size={24} strokeWidth={1.5} />
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors ${
            isActive("/profile")
              ? "bg-black text-white"
              : "text-gray-600 hover:text-black"
          }`}
          title="Profil"
        >
          <User size={24} strokeWidth={1.5} />
        </Link>
      </nav>
    </div>
  );
}

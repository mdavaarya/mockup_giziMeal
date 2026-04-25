import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Circle } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress and auto-navigate to login
    const startTime = Date.now();
    const duration = 2500; // 2.5 second loading time

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        // Navigate to login after loading complete
        setTimeout(() => navigate("/login"), 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      {/* Logo Circle */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
          <div className="text-5xl">🍴</div>
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="font-syne font-bold text-white text-4xl mb-4">GiziMeal</h1>

      {/* Tagline */}
      <p className="text-gray-400 text-center text-sm mb-16">
        Ubah Bahan Jadi Inspirasi Masakan
      </p>

      {/* Loading Indicator */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <p className="text-gray-500 text-xs">
          {Math.min(Math.round(progress), 100)}%
        </p>
      </div>
    </div>
  );
}

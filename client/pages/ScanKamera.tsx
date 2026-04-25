import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Upload, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserData, setUserData } from "@/lib/userStorage";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function ScanKamera() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!preview || !user?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/scan/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: preview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Simpan ke recent_scans per user
      const existing = getUserData<any[]>(user.id, "recent_scans", []);
      const updated = [{ ...data, scannedAt: new Date().toISOString() }, ...existing].slice(0, 20);
      setUserData(user.id, "recent_scans", updated);

      navigate("/nutrition", { state: { nutritionData: data, imagePreview: preview } });
    } catch (err: any) {
      setError("Gagal menganalisis gambar. Pastikan GEMINI_API_KEY sudah diisi di .env");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-black min-h-[calc(100vh-80px)] flex flex-col">
        <div className="flex justify-end p-4">
          <div className="bg-white/10 rounded-full px-3 py-1 text-white text-xs border border-white/20">
            Gemini Vision API
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div
            className="relative w-72 h-72 border-2 border-white rounded-2xl flex items-center justify-center mb-6 overflow-hidden cursor-pointer"
            onClick={() => !preview && fileRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Camera size={48} className="text-white mx-auto mb-3" strokeWidth={1} />
                <p className="text-white text-sm font-medium">Tap untuk pilih foto</p>
                <p className="text-gray-500 text-xs mt-1">JPG, PNG, WEBP</p>
              </div>
            )}
          </div>

          <h2 className="font-syne font-bold text-white text-lg mb-2 text-center">
            {preview ? "Siap dianalisis!" : "Arahkan ke bahan makanan"}
          </h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            {preview ? "Klik tombol di bawah untuk memulai analisis" : "Pastikan pencahayaan cukup untuk hasil akurat"}
          </p>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 text-xs px-4 py-3 rounded-xl mb-4 text-center max-w-xs">
              {error}
            </div>
          )}

          {preview ? (
            <div className="flex gap-3 w-full max-w-xs">
              <button onClick={() => { setPreview(null); setError(""); }}
                className="flex-1 border border-white/30 text-white font-syne font-bold py-3 rounded-xl hover:bg-white/5 transition-colors text-sm">
                Ganti Foto
              </button>
              <button onClick={handleAnalyze} disabled={loading}
                className="flex-1 bg-white text-black font-syne font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm">
                {loading ? "Menganalisis..." : "Analisis →"}
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black" />
              </div>
            </button>
          )}
        </div>

        <div className="bg-gray-900 p-6 border-t border-gray-800">
          <p className="text-gray-400 text-center text-sm mb-4">atau upload dari galeri</p>
          <button onClick={() => fileRef.current?.click()}
            className="w-full border border-white/30 text-white font-syne font-bold py-3 px-6 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
            <Upload size={18} />
            Pilih dari Galeri
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>
    </Layout>
  );
}
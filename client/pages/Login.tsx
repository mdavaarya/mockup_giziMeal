import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login gagal, periksa email dan password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-12">
      <div className="mb-12">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl">🍴</span>
        </div>
      </div>
      <h1 className="font-syne font-bold text-2xl text-black mb-2">Masuk ke Akun</h1>
      <p className="text-gray-500 text-sm mb-8">Selamat datang kembali di GiziMeal</p>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handleLogin} className="flex-1">
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">Email</label>
          <input type="email" placeholder="email@contoh.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black" required />
        </div>
        <div className="mb-8">
          <label className="block text-sm text-gray-600 mb-2">Password</label>
          <input type="password" placeholder="••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black" required />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-black text-white font-syne font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors mb-6 disabled:opacity-50">
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
      <p className="text-center text-gray-600 text-sm mb-6">
        Belum punya akun?{" "}
        <Link to="/register" className="font-bold text-black hover:underline">Daftar</Link>
      </p>
    </div>
  );
}

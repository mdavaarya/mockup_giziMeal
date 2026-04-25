import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Password tidak sama"); return; }
    if (form.password.length < 6) { setError("Password minimal 6 karakter"); return; }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      navigate("/onboarding-1");
    } catch (err: any) {
      setError(err.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-12">
      <div className="mb-8">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl">🍴</span>
        </div>
      </div>
      <h1 className="font-syne font-bold text-2xl text-black mb-2">Buat Akun Baru</h1>
      <p className="text-gray-500 text-sm mb-8">Bergabung dengan GiziMeal sekarang</p>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
        {[
          { label: "Nama Lengkap", name: "name", type: "text", placeholder: "Nama kamu" },
          { label: "Email", name: "email", type: "email", placeholder: "email@contoh.com" },
          { label: "Password", name: "password", type: "password", placeholder: "Min. 6 karakter" },
          { label: "Konfirmasi Password", name: "confirm", type: "password", placeholder: "Ulangi password" },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-sm text-gray-600 mb-2">{f.label}</label>
            <input type={f.type} name={f.name} placeholder={f.placeholder}
              value={(form as any)[f.name]} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black" required />
          </div>
        ))}
        <button type="submit" disabled={loading}
          className="w-full bg-black text-white font-syne font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors mt-4 disabled:opacity-50">
          {loading ? "Memproses..." : "Daftar Sekarang"}
        </button>
      </form>
      <p className="text-center text-gray-600 text-sm mt-6">
        Sudah punya akun?{" "}
        <Link to="/login" className="font-bold text-black hover:underline">Masuk</Link>
      </p>
    </div>
  );
}

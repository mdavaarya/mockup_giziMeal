# 🥗 GiziMeal

Aplikasi web untuk membantu pengguna memantau gizi harian melalui pemindaian bahan makanan berbasis kamera, pencatatan makanan, rekomendasi resep, dan konsultasi gizi berbasis AI.

---

## ✨ Fitur Utama

- **Scan Bahan Makanan** — Foto bahan makanan mentah, lalu AI (Gemini) akan mengenali bahan dan menampilkan informasi gizinya secara otomatis.
- **Catatan Makan Harian (Food Log)** — Catat setiap makanan yang dikonsumsi (sarapan, makan siang, makan malam, camilan) beserta estimasi kalori dan protein.
- **Dashboard Nutrisi** — Pantau progres kalori dan makronutrien harian/mingguan dalam bentuk grafik.
- **Rekomendasi Resep** — Temukan resep masakan Indonesia berdasarkan bahan yang tersedia, bersumber dari TheMealDB dan dibantu Gemini AI sebagai fallback.
- **GiziBot (Chat AI)** — Konsultasi nutrisi langsung dengan asisten AI yang menjawab dalam Bahasa Indonesia.
- **Profil & Onboarding** — Pengaturan profil pengguna meliputi berat badan, tinggi, usia, gender, dan target kalori harian.
- **Riwayat Scan** — Melihat kembali hasil scan bahan makanan sebelumnya.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18, React Router 6, TypeScript, Vite |
| Styling | TailwindCSS 3, Radix UI, Lucide React |
| Backend | Express 5 (Node.js), TypeScript |
| Auth & Database | Supabase |
| AI / Vision | Google Gemini API (2.5-flash, 2.0-flash, 2.0-flash-lite) |
| Resep Eksternal | TheMealDB API |
| Testing | Vitest |
| Package Manager | pnpm |
| Deployment | Vercel / Netlify |

---

## 📁 Struktur Proyek

```
GiziMeal/
├── client/                  # React SPA (frontend)
│   ├── pages/               # Halaman utama aplikasi
│   │   ├── Index.tsx        # Beranda
│   │   ├── ScanKamera.tsx   # Scan bahan makanan
│   │   ├── Nutrition.tsx    # Hasil analisis gizi
│   │   ├── FoodLog.tsx      # Catatan makan harian
│   │   ├── NutritionDashboard.tsx  # Dashboard grafik gizi
│   │   ├── Recipes.tsx      # Daftar resep
│   │   ├── DetailResep.tsx  # Detail resep
│   │   ├── Chat.tsx         # GiziBot (chat AI)
│   │   ├── ScanHistory.tsx  # Riwayat scan
│   │   ├── Profile.tsx      # Profil singkat
│   │   ├── FullProfile.tsx  # Profil lengkap
│   │   ├── Settings.tsx     # Pengaturan
│   │   ├── OnboardingStep1-3.tsx  # Onboarding awal
│   │   ├── Login.tsx        # Login
│   │   ├── Register.tsx     # Registrasi
│   │   └── Splash.tsx       # Splash screen
│   ├── components/
│   │   ├── Layout.tsx       # Layout utama dengan navigasi
│   │   ├── DetailBahanModal.tsx  # Modal detail bahan
│   │   └── ui/              # Komponen UI (Radix-based)
│   ├── context/
│   │   └── AuthContext.tsx  # State autentikasi global
│   ├── hooks/               # Custom hooks
│   ├── lib/
│   │   └── userStorage.ts   # Helper localStorage per user
│   ├── main.tsx             # Entry point & routing
│   └── global.css           # Theme & TailwindCSS config
│
├── server/                  # Express API (backend)
│   ├── index.ts             # Setup server & registrasi routes
│   └── routes/
│       ├── scan.ts          # POST /api/scan/analyze (Gemini Vision)
│       ├── recipes.ts       # GET /api/recipes/search & /:id
│       ├── chat.ts          # POST /api/chat (GiziBot)
│       ├── auth.ts          # POST /api/auth/login & /register
│       ├── profile.ts       # GET/PUT /api/profile
│       └── foodlog.ts       # CRUD /api/foodlog
│
├── shared/
│   └── api.ts               # Interface TypeScript bersama
│
├── netlify/functions/       # Netlify serverless adapter
├── netlify.toml             # Konfigurasi deploy Netlify
├── vercel.json              # Konfigurasi deploy Vercel
├── vite.config.ts           # Vite (client)
├── vite.config.server.ts    # Vite (server build)
└── package.json
```

---

## 🚀 Cara Menjalankan

### Prasyarat

- Node.js >= 18
- pnpm >= 10

### 1. Clone & Install

```bash
git clone <repo-url>
cd GiziMeal
pnpm install
```

### 2. Konfigurasi Environment

Buat file `.env` di root proyek:

```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Catatan:** Aplikasi menggunakan fallback antar model Gemini secara otomatis (2.5-flash → 2.0-flash → 2.0-flash-lite) jika quota habis.

### 3. Jalankan Development Server

```bash
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:8080`. Frontend dan backend berjalan dalam satu port yang sama melalui integrasi Vite + Express.

---

## 📜 Scripts

| Perintah | Keterangan |
|---|---|
| `pnpm dev` | Jalankan development server (client + server) |
| `pnpm build` | Build production (client + server) |
| `pnpm start` | Jalankan production server |
| `pnpm test` | Jalankan unit test (Vitest) |
| `pnpm typecheck` | Validasi TypeScript |
| `pnpm format.fix` | Format kode dengan Prettier |

---

## 🌐 API Endpoints

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/ping` | Health check |
| POST | `/api/auth/register` | Registrasi pengguna |
| POST | `/api/auth/login` | Login pengguna |
| POST | `/api/scan/analyze` | Analisis bahan makanan dari gambar |
| GET | `/api/recipes/search?ingredients=...` | Cari resep berdasarkan bahan |
| GET | `/api/recipes/:id` | Detail resep |
| POST | `/api/chat` | Chat dengan GiziBot |
| GET/PUT | `/api/profile` | Profil pengguna |
| GET/POST/DELETE | `/api/foodlog` | Catatan makan harian |

---

## ☁️ Deployment

### Vercel

```bash
# Deploy otomatis saat push ke main, atau manual:
vercel deploy
```

Konfigurasi sudah tersedia di `vercel.json`. Pastikan environment variables (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`) sudah ditambahkan di dashboard Vercel.

### Netlify

Konfigurasi tersedia di `netlify.toml`. Backend berjalan sebagai Netlify Functions dengan adapter di `netlify/functions/api.ts`.

---

## 🧠 Cara Kerja AI

### Scan Bahan Makanan
1. Pengguna memilih/memotret gambar bahan makanan.
2. Gambar dikirim ke server sebagai base64.
3. Server mengirimkan gambar ke Gemini Vision API untuk identifikasi bahan.
4. Hasil bahan dicocokkan dengan database nutrisi internal (per 100g).
5. Data gizi ditampilkan ke pengguna.

### Rekomendasi Resep
1. Bahan dari hasil scan dikirim ke TheMealDB API.
2. Jika TheMealDB tidak menemukan resep, Gemini AI digunakan sebagai fallback untuk menghasilkan resep masakan Indonesia.

### GiziBot
- Menggunakan Gemini dengan system prompt khusus sebagai asisten nutrisi berbahasa Indonesia.
- Mendukung riwayat percakapan multi-turn.

---

## 📦 Dependensi Utama

- [`@supabase/supabase-js`](https://supabase.com/docs/reference/javascript) — Auth & database
- [`google/generative-ai`](https://ai.google.dev/) (via REST) — AI vision & chat
- [`express`](https://expressjs.com/) — Backend server
- [`react-router-dom`](https://reactrouter.com/) — Client-side routing
- [`recharts`](https://recharts.org/) — Grafik nutrisi
- [`framer-motion`](https://www.framer.com/motion/) — Animasi UI
- [`zod`](https://zod.dev/) — Validasi schema

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademis / pengembangan internal.

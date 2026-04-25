import { Router, RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

function getSupabase() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

const register: RequestHandler = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: "Email, password, dan nama wajib diisi" });
    return;
  }
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.json({ user: data.user, session: data.session });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email dan password wajib diisi" });
    return;
  }
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      res.status(401).json({ error: "Email atau password salah" });
      return;
    }
    res.json({ user: data.user, session: data.session, token: data.session?.access_token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

router.post("/register", register);
router.post("/login", login);

export { router as authRoutes };

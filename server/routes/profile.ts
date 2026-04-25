import { Router, RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

function getSupabase(token?: string) {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_ANON_KEY!;
  const client = createClient(url, key);
  return client;
}

// Calculate BMR & TDEE
function calculateCalories(weight: number, height: number, age: number, gender: string, goal: string) {
  // Mifflin-St Jeor formula
  let bmr = gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  // Assume light activity (x1.375)
  let tdee = bmr * 1.375;

  // Adjust for goal
  if (goal === "lose") tdee -= 500;
  if (goal === "gain") tdee += 500;

  const calories = Math.round(tdee);
  return {
    calories,
    protein: Math.round((calories * 0.3) / 4),
    carbs: Math.round((calories * 0.45) / 4),
    fat: Math.round((calories * 0.25) / 9),
    bmr: Math.round(bmr),
  };
}

const saveProfile: RequestHandler = async (req, res) => {
  const { userId, name, weight, height, age, gender, goal, token } = req.body;

  if (!userId || !weight || !height || !age || !gender || !goal) {
    res.status(400).json({ error: "Semua field wajib diisi" });
    return;
  }

  const targets = calculateCalories(
    Number(weight), Number(height), Number(age), gender, goal
  );

  try {
    const supabase = getSupabase(token);
    const profileData = {
      user_id: userId,
      name,
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      gender,
      goal,
      ...targets,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      // If table doesn't exist yet, return calculated targets anyway
      res.json({ profile: profileData, targets });
      return;
    }

    res.json({ profile: data, targets });
  } catch (err) {
    // Fallback - return calculations even without DB
    const targets2 = calculateCalories(Number(weight), Number(height), Number(age), gender, goal);
    res.json({ profile: { userId, name, weight, height, age, gender, goal }, targets: targets2 });
  }
};

const getProfile: RequestHandler = async (req, res) => {
  const { userId } = req.params;
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Profil tidak ditemukan" });
      return;
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

router.post("/", saveProfile);
router.get("/:userId", getProfile);

export { router as profileRoutes };

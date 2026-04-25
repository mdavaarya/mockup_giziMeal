import { Router, RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
}

const getFoodLog: RequestHandler = async (req, res) => {
  const { userId, date } = req.query;
  if (!userId) {
    res.status(400).json({ error: "userId wajib diisi" });
    return;
  }

  const targetDate = (date as string) || new Date().toISOString().split("T")[0];

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", targetDate)
      .order("created_at", { ascending: true });

    if (error) {
      res.json({ logs: [], date: targetDate });
      return;
    }
    res.json({ logs: data || [], date: targetDate });
  } catch (err) {
    res.json({ logs: [], date: targetDate });
  }
};

const addFoodLog: RequestHandler = async (req, res) => {
  const { userId, foodName, mealType, calories, protein, carbs, fat, date } = req.body;

  if (!userId || !foodName || !mealType) {
    res.status(400).json({ error: "userId, foodName, dan mealType wajib diisi" });
    return;
  }

  const logData = {
    user_id: userId,
    food_name: foodName,
    meal_type: mealType, // sarapan, makan_siang, makan_malam, snack
    calories: Number(calories) || 0,
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fat: Number(fat) || 0,
    date: date || new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("food_logs")
      .insert(logData)
      .select()
      .single();

    if (error) {
      // Return the data anyway so frontend can use it locally
      res.json({ log: logData, saved: false });
      return;
    }
    res.json({ log: data, saved: true });
  } catch (err) {
    res.json({ log: logData, saved: false });
  }
};

const deleteFoodLog: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("food_logs").delete().eq("id", id);
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

router.get("/", getFoodLog);
router.post("/", addFoodLog);
router.delete("/:id", deleteFoodLog);

export { router as foodlogRoutes };

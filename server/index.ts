import "dotenv/config";
import express from "express";
import cors from "cors";
import { scanRoutes } from "./routes/scan";
import { recipeRoutes } from "./routes/recipes";
import { chatRoutes } from "./routes/chat";
import { authRoutes } from "./routes/auth";
import { profileRoutes } from "./routes/profile";
import { foodlogRoutes } from "./routes/foodlog";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.get("/api/ping", (_req, res) => {
    res.json({ message: "GiziMeal API is running!" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/scan", scanRoutes);
  app.use("/api/recipes", recipeRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/foodlog", foodlogRoutes);

  return app;
}

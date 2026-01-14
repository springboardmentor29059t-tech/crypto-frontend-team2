import { Router } from "express";
import { z } from "zod";
import { defaultSettings } from "../data/mockData";
import { UserSettings } from "../types";
import { readDB, writeDB } from "../data/db";
import { AuthedRequest } from "../utils/auth";

const router = Router();
const settingsSchema = z.object({
  profile: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    timezone: z.string().optional(),
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    priceAlerts: z.boolean(),
    riskAlerts: z.boolean(),
  }),
  appearance: z.object({
    darkMode: z.boolean(),
  }),
});

router.get("/", async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const db = await readDB();
  const userSettings = db.settings[userId] || { ...defaultSettings };

  // Ensure defaults exist and persist if missing
  if (!db.settings[userId]) {
    db.settings[userId] = userSettings;
    await writeDB(db);
  }

  res.json(userSettings);
});

router.put("/", async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const parse = settingsSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }

  const db = await readDB();
  db.settings[userId] = parse.data as UserSettings;
  await writeDB(db);
  res.json(db.settings[userId]);
});

export default router;


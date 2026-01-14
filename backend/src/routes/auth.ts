import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { AuthedRequest, requireAuth, signToken } from "../utils/auth";
import { readDB, writeDB } from "../data/db";
import { defaultSettings } from "../data/mockData";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/register", async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }

  const { name, email, password } = parse.data;
  const db = await readDB();

  if (db.users.some((u) => u.email === email)) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = {
    id: uuid(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  db.settings[user.id] = { ...defaultSettings };
  await writeDB(db);

  const token = signToken(user.id);

  return res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
  });
});

router.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }

  const { email, password } = parse.data;
  const db = await readDB();
  const user = db.users.find((u) => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken(user.id);
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.post("/logout", requireAuth, async (req: AuthedRequest, res) => {
  const header = req.headers.authorization!;
  const token = header.slice("Bearer ".length);
  const db = await readDB();

  if (!db.revokedTokens.includes(token)) {
    db.revokedTokens.push(token);
    await writeDB(db);
  }

  return res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const db = await readDB();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
});

export default router;


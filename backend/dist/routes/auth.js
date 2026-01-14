"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const auth_1 = require("../utils/auth");
const db_1 = require("../data/db");
const mockData_1 = require("../data/mockData");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
router.post("/register", async (req, res) => {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: parse.error.flatten() });
    }
    const { name, email, password } = parse.data;
    const db = await (0, db_1.readDB)();
    if (db.users.some((u) => u.email === email)) {
        return res.status(409).json({ error: "Email already registered" });
    }
    const passwordHash = bcryptjs_1.default.hashSync(password, 10);
    const user = {
        id: (0, uuid_1.v4)(),
        name,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    db.settings[user.id] = { ...mockData_1.defaultSettings };
    await (0, db_1.writeDB)(db);
    const token = (0, auth_1.signToken)(user.id);
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
    const db = await (0, db_1.readDB)();
    const user = db.users.find((u) => u.email === email);
    if (!user || !bcryptjs_1.default.compareSync(password, user.passwordHash)) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = (0, auth_1.signToken)(user.id);
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});
router.post("/logout", auth_1.requireAuth, async (req, res) => {
    const header = req.headers.authorization;
    const token = header.slice("Bearer ".length);
    const db = await (0, db_1.readDB)();
    if (!db.revokedTokens.includes(token)) {
        db.revokedTokens.push(token);
        await (0, db_1.writeDB)(db);
    }
    return res.json({ message: "Logged out" });
});
router.get("/me", auth_1.requireAuth, async (req, res) => {
    const db = await (0, db_1.readDB)();
    const user = db.users.find((u) => u.id === req.userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    return res.json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
});
exports.default = router;

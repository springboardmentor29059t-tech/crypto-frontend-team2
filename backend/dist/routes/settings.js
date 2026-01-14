"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const mockData_1 = require("../data/mockData");
const db_1 = require("../data/db");
const router = (0, express_1.Router)();
const settingsSchema = zod_1.z.object({
    profile: zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().optional(),
        timezone: zod_1.z.string().optional(),
    }),
    notifications: zod_1.z.object({
        email: zod_1.z.boolean(),
        push: zod_1.z.boolean(),
        priceAlerts: zod_1.z.boolean(),
        riskAlerts: zod_1.z.boolean(),
    }),
    appearance: zod_1.z.object({
        darkMode: zod_1.z.boolean(),
    }),
});
router.get("/", async (req, res) => {
    const userId = req.userId;
    const db = await (0, db_1.readDB)();
    const userSettings = db.settings[userId] || { ...mockData_1.defaultSettings };
    // Ensure defaults exist and persist if missing
    if (!db.settings[userId]) {
        db.settings[userId] = userSettings;
        await (0, db_1.writeDB)(db);
    }
    res.json(userSettings);
});
router.put("/", async (req, res) => {
    const userId = req.userId;
    const parse = settingsSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: parse.error.flatten() });
    }
    const db = await (0, db_1.readDB)();
    db.settings[userId] = parse.data;
    await (0, db_1.writeDB)(db);
    res.json(db.settings[userId]);
});
exports.default = router;

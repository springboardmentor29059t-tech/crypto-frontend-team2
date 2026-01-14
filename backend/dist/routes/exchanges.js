"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const mockData_1 = require("../data/mockData");
const router = (0, express_1.Router)();
const exchanges = [...mockData_1.exchanges];
const connectSchema = zod_1.z.object({
    id: zod_1.z.string(),
    apiKey: zod_1.z.string().min(10),
    apiSecret: zod_1.z.string().min(10),
});
router.get("/", (_req, res) => {
    res.json({ items: exchanges });
});
router.post("/connect", (req, res) => {
    const parse = connectSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: parse.error.flatten() });
    }
    const { id } = parse.data;
    const exchange = exchanges.find((e) => e.id === id);
    if (!exchange) {
        return res.status(404).json({ error: "Exchange not found" });
    }
    exchange.connected = true;
    exchange.status = "healthy";
    exchange.lastSync = "just now";
    res.json({ message: "Exchange connected", exchange });
});
router.post("/disconnect/:id", (req, res) => {
    const exchange = exchanges.find((e) => e.id === req.params.id);
    if (!exchange) {
        return res.status(404).json({ error: "Exchange not found" });
    }
    exchange.connected = false;
    exchange.status = "disconnected";
    exchange.lastSync = null;
    exchange.assets = 0;
    exchange.value = 0;
    res.json({ message: "Exchange disconnected", exchange });
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const holdings_1 = __importDefault(require("./routes/holdings"));
const trades_1 = __importDefault(require("./routes/trades"));
const alerts_1 = __importDefault(require("./routes/alerts"));
const exchanges_1 = __importDefault(require("./routes/exchanges"));
const settings_1 = __importDefault(require("./routes/settings"));
const auth_2 = require("./utils/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "crypto-guardian-backend", timestamp: new Date().toISOString() });
});
app.use("/auth", auth_1.default);
app.use("/holdings", auth_2.requireAuth, holdings_1.default);
app.use("/trades", auth_2.requireAuth, trades_1.default);
app.use("/alerts", auth_2.requireAuth, alerts_1.default);
app.use("/exchanges", auth_2.requireAuth, exchanges_1.default);
app.use("/settings", auth_2.requireAuth, settings_1.default);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});
app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
});

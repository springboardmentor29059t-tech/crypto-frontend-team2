"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../data/db");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const signToken = (userId) => jsonwebtoken_1.default.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
exports.signToken = signToken;
const requireAuth = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing bearer token" });
    }
    const token = header.slice("Bearer ".length);
    try {
        const db = await (0, db_1.readDB)();
        if (db.revokedTokens.includes(token)) {
            return res.status(401).json({ error: "Session expired. Please log in again." });
        }
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = payload.sub;
        return next();
    }
    catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
exports.requireAuth = requireAuth;

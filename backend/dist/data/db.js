"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeDB = exports.readDB = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, "../../database.json");
const defaultDB = {
    users: [],
    revokedTokens: [],
    settings: {},
};
const readDB = async () => {
    try {
        const raw = await promises_1.default.readFile(dbPath, "utf-8");
        return JSON.parse(raw);
    }
    catch (error) {
        if (error?.code === "ENOENT") {
            await (0, exports.writeDB)(defaultDB);
            return { ...defaultDB };
        }
        throw error;
    }
};
exports.readDB = readDB;
const writeDB = async (data) => {
    await promises_1.default.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
};
exports.writeDB = writeDB;

import fs from "fs/promises";
import path from "path";
import { User, UserSettings, PriceSnapshot, Notification, Holding } from "../types";

export interface Database {
  users: User[];
  revokedTokens: string[];
  settings: Record<string, UserSettings>;
  priceSnapshots: PriceSnapshot[];
  notifications: Notification[];
  holdings: Holding[];
}

const dbPath = path.join(__dirname, "../../database.json");

const defaultDB: Database = {
  users: [],
  revokedTokens: [],
  settings: {},
  priceSnapshots: [],
  notifications: [],
  holdings: [],
};

export const readDB = async (): Promise<Database> => {
  try {
    const raw = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(raw) as Database;
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      await writeDB(defaultDB);
      return { ...defaultDB };
    }
    throw error;
  }
};

export const writeDB = async (data: Database) => {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
};


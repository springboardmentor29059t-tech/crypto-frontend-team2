import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { readDB } from "../data/db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface AuthedRequest extends Request {
  userId?: string;
}

export const signToken = (userId: string) =>
  jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });

export const requireAuth = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  const token = header.slice("Bearer ".length);
  try {
    const db = await readDB();
    if (db.revokedTokens.includes(token)) {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }

    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    req.userId = payload.sub as string;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


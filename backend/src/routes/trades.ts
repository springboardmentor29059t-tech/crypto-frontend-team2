import { Router } from "express";
import { trades } from "../data/mockData";

const router = Router();

router.get("/", (_req, res) => {
  // Convert USD prices to INR (approximate conversion rate)
  const tradesInr = trades.map((trade) => ({
    ...trade,
    price: trade.price * 83,
    total: trade.total * 83,
  }));
  res.json({ items: tradesInr });
});

export default router;


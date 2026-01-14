import { Router } from "express";
import { holdings as mockHoldings } from "../data/mockData";
import { getLatestPrices } from "../services/priceSnapshots";
import { readDB, writeDB } from "../data/db";
import { Holding } from "../types";
import { AuthedRequest } from "../utils/auth";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const addHoldingSchema = z.object({
  symbol: z.string().min(1).max(10),
  name: z.string().min(1),
  amount: z.number().positive(),
  avgBuyPrice: z.number().positive(),
  color: z.string().optional(),
});

// Get all holdings
router.get("/", async (_req: AuthedRequest, res) => {
  try {
    const db = await readDB();
    let holdings = db.holdings || [];

    // If no holdings in DB, initialize with mock data
    if (holdings.length === 0 && mockHoldings.length > 0) {
      holdings = mockHoldings.map((h) => ({
        ...h,
        id: uuidv4(),
      }));
      db.holdings = holdings;
      await writeDB(db);
    }

    // Get latest prices from CoinGecko
    const latestPrices = await getLatestPrices();
    
    // Update holdings with latest prices
    const updatedHoldings = holdings.map((holding) => {
      const priceSnapshot = latestPrices.get(holding.symbol);
      const currentPrice = priceSnapshot?.priceInr || holding.price;
      const amount = holding.amount;
      const avgBuyPrice = holding.avgBuyPrice || currentPrice;
      
      // Calculate P&L
      const pnl = (currentPrice - avgBuyPrice) * amount;
      const pnlPercent = ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100;
      
      if (priceSnapshot) {
        return {
          ...holding,
          price: priceSnapshot.priceInr || holding.price,
          value: (priceSnapshot.priceInr || holding.price) * amount,
          change24h: priceSnapshot.change24h || holding.change24h || 0,
          change7d: priceSnapshot.change7d || holding.change7d || 0,
          pnl,
          pnlPercent,
        };
      }
      
      // Fallback: use existing price
      return {
        ...holding,
        price: currentPrice,
        value: currentPrice * amount,
        pnl,
        pnlPercent,
      };
    });

    // Calculate total value for allocation
    const totalValue = updatedHoldings.reduce((sum, h) => sum + h.value, 0);
    const holdingsWithAllocation = updatedHoldings.map((holding) => ({
      ...holding,
      allocation: totalValue > 0 ? (holding.value / totalValue) * 100 : 0,
    }));

    res.json({ items: holdingsWithAllocation });
  } catch (error) {
    console.error("Error fetching holdings with prices:", error);
    res.status(500).json({ error: "Failed to fetch holdings" });
  }
});

// Add a new holding
router.post("/", async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const data = addHoldingSchema.parse(req.body);

    // Get latest price for the symbol
    const latestPrices = await getLatestPrices();
    const priceSnapshot = latestPrices.get(data.symbol.toUpperCase());
    const currentPrice = priceSnapshot?.priceInr || data.avgBuyPrice;
    
    // Calculate initial values
    const amount = data.amount;
    const avgBuyPrice = data.avgBuyPrice;
    const value = currentPrice * amount;
    const pnl = (currentPrice - avgBuyPrice) * amount;
    const pnlPercent = ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100;

    const newHolding: Holding = {
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      amount,
      value,
      price: currentPrice,
      change24h: priceSnapshot?.change24h || 0,
      change7d: priceSnapshot?.change7d || 0,
      avgBuyPrice,
      pnl,
      pnlPercent,
      allocation: 0, // Will be calculated when fetching all holdings
      color: data.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };

    const db = await readDB();
    db.holdings.push(newHolding);
    await writeDB(db);

    res.status(201).json(newHolding);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error adding holding:", error);
    res.status(500).json({ error: "Failed to add holding" });
  }
});

// Delete a holding
router.delete("/:symbol", async (req: AuthedRequest, res) => {
  try {
    const { symbol } = req.params;
    const db = await readDB();
    
    const index = db.holdings.findIndex(
      (h) => h.symbol.toUpperCase() === symbol.toUpperCase()
    );

    if (index === -1) {
      return res.status(404).json({ error: "Holding not found" });
    }

    db.holdings.splice(index, 1);
    await writeDB(db);

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting holding:", error);
    res.status(500).json({ error: "Failed to delete holding" });
  }
});

export default router;


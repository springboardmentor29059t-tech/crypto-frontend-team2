import { Router } from "express";
import { getPriceHistory, getLatestPrices } from "../services/priceSnapshots";
import { AuthedRequest } from "../utils/auth";
import { fetchCoinPrices } from "../services/coingecko";

const router = Router();

// Get latest prices for all tracked coins
router.get("/latest", async (_req: AuthedRequest, res) => {
  try {
    const prices = await getLatestPrices();
    const pricesArray = Array.from(prices.values());
    res.json({ items: pricesArray });
  } catch (error) {
    console.error("Error fetching latest prices:", error);
    res.status(500).json({ error: "Failed to fetch latest prices" });
  }
});

// Get price history for a specific symbol
router.get("/history/:symbol", async (req: AuthedRequest, res) => {
  try {
    const { symbol } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    const history = await getPriceHistory(symbol, days);
    res.json({ items: history });
  } catch (error) {
    console.error("Error fetching price history:", error);
    res.status(500).json({ error: "Failed to fetch price history" });
  }
});

// Endpoint to fetch live prices
router.get("/live-prices", async (_req, res) => {
  try {
    const symbols = ["BTC", "ETH", "SOL", "BNB", "AVAX", "MATIC", "LINK"];
    const livePrices = await fetchCoinPrices(symbols);

    const prices = Array.from(livePrices.entries()).map(([symbol, data]) => ({
      symbol,
      priceInr: data.inr,
      priceUsd: data.usd,
      change24h: data.inr_24h_change,
      change7d: data.inr_7d_change,
    }));

    res.json({ prices });
  } catch (error) {
    console.error("Error fetching live prices:", error);
    res.status(500).json({ error: "Failed to fetch live prices" });
  }
});

export default router;


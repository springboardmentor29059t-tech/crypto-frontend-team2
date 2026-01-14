import { PriceSnapshot } from "../types";
import { fetchCoinPrices, fetchCoinMarketData, updateUSDToINRRate } from "./coingecko";
import { readDB, writeDB } from "../data/db";
import { v4 as uuidv4 } from "uuid";

const TRACKED_SYMBOLS = [
  "BTC",
  "ETH",
  "SOL",
  "BNB",
  "AVAX",
  "MATIC",
  "LINK",
  "USDT",
  "USDC",
  "XRP",
  "ADA",
  "DOGE",
];

export async function createPriceSnapshots(): Promise<PriceSnapshot[]> {
  try {
    // Update USD/INR rate first
    await updateUSDToINRRate();

    // Fetch prices and market data
    const [priceMap, marketMap] = await Promise.all([
      fetchCoinPrices(TRACKED_SYMBOLS),
      fetchCoinMarketData(TRACKED_SYMBOLS),
    ]);

    const snapshots: PriceSnapshot[] = [];
    const timestamp = new Date().toISOString();

    for (const symbol of TRACKED_SYMBOLS) {
      const priceData = priceMap.get(symbol);
      const marketData = marketMap.get(symbol);

      if (priceData) {
        const snapshot: PriceSnapshot = {
          id: uuidv4(),
          symbol,
          price: priceData.usd || 0,
          priceInr: priceData.inr || 0,
          change24h: priceData.inr_24h_change || priceData.usd_24h_change || 0,
          change7d: priceData.inr_7d_change || priceData.usd_7d_change || 0,
          marketCap: marketData?.market_cap || 0,
          volume24h: marketData?.total_volume || 0,
          timestamp,
        };

        snapshots.push(snapshot);
      }
    }

    // Save to database
    const db = await readDB();
    db.priceSnapshots.push(...snapshots);

    // Keep only last 30 days of snapshots (cleanup old data)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    db.priceSnapshots = db.priceSnapshots.filter(
      (snapshot) => new Date(snapshot.timestamp) >= thirtyDaysAgo
    );

    await writeDB(db);

    console.log(`Created ${snapshots.length} price snapshots`);
    return snapshots;
  } catch (error) {
    console.error("Error creating price snapshots:", error);
    throw error;
  }
}

export async function getPriceHistory(
  symbol: string,
  days: number = 30
): Promise<PriceSnapshot[]> {
  const db = await readDB();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return db.priceSnapshots
    .filter(
      (snapshot) =>
        snapshot.symbol === symbol.toUpperCase() &&
        new Date(snapshot.timestamp) >= cutoffDate
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function getLatestPrices(): Promise<Map<string, PriceSnapshot>> {
  const db = await readDB();
  const priceMap = new Map<string, PriceSnapshot>();

  // Get the latest snapshot for each symbol
  for (const symbol of TRACKED_SYMBOLS) {
    const snapshots = db.priceSnapshots
      .filter((s) => s.symbol === symbol)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

    if (snapshots.length > 0) {
      priceMap.set(symbol, snapshots[0]);
    }
  }

  return priceMap;
}


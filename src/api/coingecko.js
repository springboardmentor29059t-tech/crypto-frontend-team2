/**
 * 🛡️ FRONTEND MARKET CONNECTOR
 * Optimized for "Backend-First" Architecture.
 * UPDATED: Includes Deduplication Logic to fix Chart Spikes.
 */
import api from './axiosConfig';

const BASE_URL = '/portfolio';

// ✅ CACHE: Keeps data in memory so switching tabs is instant
const historyCache = {};

/**
 * 📊 MARKET DATA & PRICING
 * Fetches the list of coins from your Database (via Backend).
 */
export const getTopCoins = async () => {
  try {
    const response = await api.get(`${BASE_URL}/market-data`);
    const data = response.data;
    // Backend returns a direct list of Assets
    return Array.isArray(data) ? data : (data.coins || []);
  } catch (error) {
    console.error("📡 Market Data Error:", error.message);
    return [];
  }
};

/**
 * 🌍 AGGREGATE MASTER PULSE (Portfolio Chart)
 * 🛑 FIX 1: Uses SEQUENTIAL LOOP to prevent 429 Rate Limits.
 * 🛑 FIX 2: Uses DEDUPLICATION to prevent Double Counting in Chart.
 */
export const getPortfolioHistory = async (holdings, days = '7') => {
  if (!holdings || holdings.length === 0) return [];

  const combinedHistory = {}; // Global Timeline: { time: totalPortfolioValue }

  // Filter active assets only (ignore zero balances)
  const activeAssets = holdings.filter(h => h.assetId && parseFloat(h.quantity) > 0);

  // 🔄 SEQUENTIAL LOOP (The Traffic Control Fix)
  for (const asset of activeAssets) {
    try {
      const assetId = asset.assetId.toLowerCase();
      const cacheKey = `${assetId}-${days}`;
      let prices = [];

      // A. Check Frontend Cache (Instant)
      if (historyCache[cacheKey]) {
        prices = historyCache[cacheKey];
      }
      // B. Fetch from Backend
      else {
        const response = await api.get(`${BASE_URL}/market-history/${assetId}`, {
          params: { days }
        });

        // Handle "Safe Response" (Empty object if 429)
        const data = response.data || {};
        // Backend returns { prices: [...] } or just [...]
        prices = Array.isArray(data) ? data : (data.prices || []);

        if (prices.length > 0) {
          historyCache[cacheKey] = prices; // Save to frontend cache
        }
      }

      // 🛑 CRITICAL FIX: DEDUPLICATE TIME BUCKETS
      // Before adding to the global total, we ensure this coin
      // only contributes ONCE per hour.
      const coinHourlyMap = {};

      if (prices.length > 0) {
        prices.forEach(([timestamp, price]) => {
          // Round to nearest hour (3600000ms)
          const timeKey = Math.floor(timestamp / 3600000) * 3600000;

          // Overwrite existing entry for this hour (keep the latest price)
          // instead of adding to it. This prevents the "Double Value" bug.
          coinHourlyMap[timeKey] = price;
        });

        // NOW add this coin's hourly values to the Global Combined History
        Object.entries(coinHourlyMap).forEach(([time, price]) => {
          const timeKey = parseInt(time);
          const assetValue = price * parseFloat(asset.quantity);

          // Add to global total
          combinedHistory[timeKey] = (combinedHistory[timeKey] || 0) + assetValue;
        });
      }

    } catch (err) {
      // If one coin fails, Log it but DO NOT crash the whole chart.
      console.warn(`⚠️ Skipped history for ${asset.assetId}:`, err.message);
    }
  }

  // 3. FORMAT FOR RECHARTS
  const chartData = Object.entries(combinedHistory)
    .map(([time, value]) => ({
      date: parseInt(time), // Recharts needs int timestamp
      value: value
    }))
    .sort((a, b) => a.date - b.date); // Ensure chronological order

  return chartData;
};

/**
 * 📈 SINGLE COIN HISTORY (Detail Modal)
 */
export const getCoinHistory = async (coinId, days = '7') => {
  const cacheKey = `${coinId.toLowerCase()}-${days}`;

  // Check Cache
  if (historyCache[cacheKey]) {
    return historyCache[cacheKey].map(([date, price]) => ({ ms: date, price }));
  }

  try {
    const response = await api.get(`${BASE_URL}/market-history/${coinId}`, {
      params: { days }
    });

    const data = response.data;
    const prices = Array.isArray(data) ? data : (data.prices || []);

    if (prices.length > 0) {
      historyCache[cacheKey] = prices;
    }

    return prices.map(([ms, val]) => ({ ms, price: val }));
  } catch (error) {
    console.warn(`History fetch failed for ${coinId}`);
    return [];
  }
};

/**
 * 🕵️ SECURITY AUDIT MAPPING
 */
export const getCoinDetails = async (coinId) => {
  try {
    const response = await api.post(`${BASE_URL}/risk-report`, {
      assetId: coinId
    });
    return response.data;
  } catch (error) {
    console.error("🛡️ Audit Handshake Failed:", error.message);
    return null;
  }
};

/**
 * 🔍 SEARCH
 */
export const searchCoins = async (query) => {
  if (!query || query.length < 2) return [];
  try {
    const response = await api.get(`${BASE_URL}/search`, {
      params: { query }
    });
    const data = response.data;
    return Array.isArray(data) ? data : (data.coins || []);
  } catch (error) { return []; }
};
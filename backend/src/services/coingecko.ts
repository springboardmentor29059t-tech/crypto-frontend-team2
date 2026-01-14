interface CoinGeckoPrice {
  [coinId: string]: {
    inr: number;
    inr_24h_change: number;
    inr_7d_change?: number;
    usd: number;
    usd_24h_change: number;
    usd_7d_change?: number;
  };
}

interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
}

// Mapping of common symbols to CoinGecko IDs
const COIN_ID_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  AVAX: "avalanche-2",
  MATIC: "matic-network",
  LINK: "chainlink",
  USDT: "tether",
  USDC: "usd-coin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  DOT: "polkadot",
  LTC: "litecoin",
  UNI: "uniswap",
  ATOM: "cosmos",
  ETC: "ethereum-classic",
};

// INR to USD conversion rate (you can fetch this from an API or update periodically)
let USD_TO_INR_RATE = 83.0; // Approximate rate, should be updated periodically

export async function fetchUSDToINRRate(): Promise<number> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/exchange_rates"
    );
    const data = await response.json();
    // CoinGecko doesn't directly provide USD/INR, so we'll use a fallback
    // In production, use a currency API like exchangerate-api.com or fixer.io
    return USD_TO_INR_RATE;
  } catch (error) {
    console.error("Failed to fetch USD/INR rate, using default:", error);
    return USD_TO_INR_RATE;
  }
}

export async function updateUSDToINRRate(): Promise<void> {
  try {
    // Using exchangerate-api.com free tier (or you can use fixer.io, currencyapi.com, etc.)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/USD`
    );
    const data = await response.json();
    if (data.rates && data.rates.INR) {
      USD_TO_INR_RATE = data.rates.INR;
    }
  } catch (error) {
    console.error("Failed to update USD/INR rate:", error);
  }
}

export async function fetchCoinPrices(
  symbols: string[]
): Promise<Map<string, CoinGeckoPrice[string]>> {
  const coinIds = symbols
    .map((symbol) => COIN_ID_MAP[symbol.toUpperCase()])
    .filter(Boolean);

  if (coinIds.length === 0) {
    return new Map();
  }

  try {
    const ids = coinIds.join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=inr,usd&include_24hr_change=true&include_7d_change=true`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data: CoinGeckoPrice = await response.json();
    const priceMap = new Map<string, CoinGeckoPrice[string]>();

    // Map back to symbols
    for (const [symbol, coinId] of Object.entries(COIN_ID_MAP)) {
      if (coinIds.includes(coinId) && data[coinId]) {
        priceMap.set(symbol, data[coinId]);
      }
    }

    return priceMap;
  } catch (error) {
    console.error("Error fetching CoinGecko prices:", error);
    throw error;
  }
}

export async function fetchCoinMarketData(
  symbols: string[]
): Promise<Map<string, CoinGeckoMarketData>> {
  const coinIds = symbols
    .map((symbol) => COIN_ID_MAP[symbol.toUpperCase()])
    .filter(Boolean);

  if (coinIds.length === 0) {
    return new Map();
  }

  try {
    const ids = coinIds.join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${ids}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h%2C7d`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data: CoinGeckoMarketData[] = await response.json();
    const marketMap = new Map<string, CoinGeckoMarketData>();

    // Create reverse mapping
    const idToSymbol: Record<string, string> = {};
    for (const [symbol, coinId] of Object.entries(COIN_ID_MAP)) {
      idToSymbol[coinId] = symbol;
    }

    for (const coin of data) {
      const symbol = idToSymbol[coin.id];
      if (symbol) {
        marketMap.set(symbol, coin);
      }
    }

    return marketMap;
  } catch (error) {
    console.error("Error fetching CoinGecko market data:", error);
    throw error;
  }
}

export function getCoinId(symbol: string): string | null {
  return COIN_ID_MAP[symbol.toUpperCase()] || null;
}

export function addCoinMapping(symbol: string, coinId: string): void {
  COIN_ID_MAP[symbol.toUpperCase()] = coinId;
}


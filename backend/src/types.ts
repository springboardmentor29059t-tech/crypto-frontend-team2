export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Holding {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  price: number;
  change24h: number;
  change7d: number;
  avgBuyPrice: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
  color: string;
}

export interface Trade {
  id: string;
  type: "buy" | "sell";
  symbol: string;
  name: string;
  amount: number;
  price: number;
  total: number;
  exchange: string;
  date: string;
  status: "completed" | "pending" | "failed";
  txHash: string;
  color: string;
}

export interface Alert {
  id: string;
  type: "danger" | "warning" | "info";
  title: string;
  description: string;
  token: string | null;
  time: string;
  action: string | null;
  source: string;
  read: boolean;
}

export interface Exchange {
  id: string;
  name: string;
  logo: string;
  description: string;
  connected: boolean;
  lastSync: string | null;
  assets: number;
  value: number;
  status: "healthy" | "degraded" | "disconnected";
}

export interface UserSettings {
  profile: {
    name: string;
    email: string;
    phone?: string;
    timezone?: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
    riskAlerts: boolean;
  };
  appearance: {
    darkMode: boolean;
  };
}

export interface PriceSnapshot {
  id: string;
  symbol: string;
  price: number;
  priceInr: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  timestamp: string;
}

export interface ContractReputation {
  address: string;
  symbol: string;
  isScam: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  sources: {
    etherscan: {
      verified: boolean;
      reputation: "good" | "neutral" | "suspicious" | "unknown";
    };
    cryptoScamDB: {
      flagged: boolean;
      reason?: string;
    };
  };
  lastChecked: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "price" | "risk" | "trade" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}


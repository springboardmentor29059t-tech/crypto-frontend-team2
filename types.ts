
export interface User {
  id: number;
  fullName: string;
  email: string;
  profileImage?: string;
}

export interface UserProfile {
  id?: number;
  fullName: string;
  email: string;
  preferredExchanges: string[];
  walletType: 'Exchange' | 'Cold Wallet' | 'Hot Wallet';
  riskPreference: 'Low' | 'Medium' | 'High';
  portfolioGoal: 'Long-term' | 'Short-term trading' | 'Tax tracking';
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  profileImage?: string;
}

export interface UserSettings {
  id?: number;
  priceAlertThreshold: number;
  riskAlertEnabled: boolean;
  preferredFiat: string;
  notificationEmail: string;
  phoneNumber: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  notificationToggles: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface Holding {
  id: number;
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice?: number;
  totalValue?: number;
  pnl?: number;
  pnlPercentage?: number;
  image?: string;
  exchange?: string;
}

export interface RiskAlert {
  id: string;
  type: 'SCAM' | 'HIGH_VOLATILITY' | 'CONTRACT_RISK' | 'LOW_LIQUIDITY';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  tokenName: string;
  description: string;
  timestamp: string;
  source?: string;
}

export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  currentPriceInr: number;
  marketCap: number;
  marketCapRank: number;
  priceChangePercentage24h: number;
  sparklineIn7d?: { price: number[] };
}

export interface MarketOverview {
  totalMarketCap: number;
  totalMarketCapInr: number;
  totalVolume24h: number;
  totalVolume24hInr: number;
  marketCapChangePercentage24h: number;
  topGainers: MarketCoin[];
  topLosers: MarketCoin[];
  trending: MarketCoin[];
}

export interface PriceHistory {
  timestamp: number;
  price: number;
}

export enum AuthStatus {
  IDLE,
  LOADING,
  AUTHENTICATED,
  UNAUTHENTICATED
}

export interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}




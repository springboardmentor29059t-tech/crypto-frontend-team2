
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088';
const COINGECKO_URL = 'https://api.coingecko.com/api/v3';

// Setup Axios instance with interceptors for JWT
export const api = axios.create({
  baseURL: BACKEND_URL
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (data: {
  fullName: string;
  email: string;
  password: string;
}) => {
  const res = await fetch(`${BACKEND_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res.text();
    try {
      const jsonError = JSON.parse(errorData);
      throw new Error(jsonError.message || "Registration failed");
    } catch (e) {
      throw new Error(errorData || "Registration failed");
    }
  }
  return res.json();
};

export const login = async (data: {
  email: string;
  password: string;
}) => {
  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res.text();
    try {
      const jsonError = JSON.parse(errorData);
      throw new Error(jsonError.message || "Login failed");
    } catch (e) {
      throw new Error(errorData || "Login failed");
    }
  }
  return res.json();
};

export const getProfile = async () => {
  const res = await api.get('/api/profile');
  return res.data;
};

export const getPortfolioSummary = async () => {
  const res = await api.get('/portfolio/summary');
  return res.data;
};

export const getMarketOverview = async () => {
  const res = await api.get('/api/market/overview');
  return res.data;
};

export const getGlobalMarketData = async () => {
  const res = await api.get('/api/market/global');
  return res.data;
};

export const getGlobalAssets = async () => {
  const res = await api.get('/portfolio/global');
  return res.data;
};

export const mockApi = {
  login: async (email: string, pass: string) => {
    const res = await api.post('/auth/login', { email, password: pass });
    return res.data;
  },

  register: async (fullName: string, email: string, pass: string) => {
    const res = await api.post('/auth/register', { fullName, email, password: pass });
    return res.data;
  },

  getHoldings: async () => {
    try {
      const response = await api.get('/api/assets');
      return response.data.map((asset: any) => ({
        id: asset.id,
        coinId: asset.name.toLowerCase().replace(/\s+/g, '-'),
        symbol: asset.symbol,
        name: asset.name,
        amount: asset.amount,
        purchasePrice: asset.avgBuyPrice,
        avgBuyPrice: asset.avgBuyPrice,
        image: `https://assets.coingecko.com/coins/images/1/small/bitcoin.png`
      }));
    } catch (err) {
      console.error("Failed to fetch assets", err);
      return [];
    }
  },

  dispatchNotification: async (type: 'SMS' | 'EMAIL', target: string, body: string) => {
    return api.post('/notifications/dispatch', { type, target, body });
  },

  uploadHoldingsCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/portfolio/upload-csv', formData);
    return res.data;
  },

  uploadTradesCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/portfolio/upload-trades-csv', formData);
    return res.data;
  }
};

export const fetchLivePrices = async (ids: string[]) => {
  try {
    const res = await axios.get(`${COINGECKO_URL}/simple/price`, {
      params: {
        ids: ids.join(','),
        vs_currencies: 'usd,inr',
        include_24hr_change: 'true',
        include_market_cap: 'true',
        include_24hr_vol: 'true'
      }
    });
    return res.data;
  } catch (err) {
    console.error("CoinGecko API Error", err);
    return {};
  }
};

export const getLatestNews = async () => {
  const res = await api.get('/api/news/latest');
  return res.data;
};

export const addHolding = async (holding: any) => {
  const payload = {
    symbol: holding.cryptoSymbol || holding.symbol,
    name: holding.cryptoName || holding.name,
    quantity: parseFloat(holding.quantity || holding.amount),
    avgBuyPrice: parseFloat(holding.purchasePrice || holding.avgBuyPrice),
    source: holding.source || 'Binance'
  };
  // DIRECT FIX: Use AssetController handling
  const res = await api.post('/api/assets', payload);
  return res.data;
};

export const updateAsset = async (id: number, asset: any) => {
  const payload = {
    symbol: asset.symbol,
    name: asset.name,
    quantity: asset.amount,
    avgBuyPrice: asset.avgBuyPrice,
    source: asset.source
  };
  const res = await api.put(`/api/assets/${id}`, payload);
  return res.data;
};

export const deleteAsset = async (id: number) => {
  const res = await api.delete(`/api/assets/${id}`);
  return res.data;
};

export const fetchHistory = async (coinId: string, days: number = 7) => {
  try {
    const res = await axios.get(`${COINGECKO_URL}/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: 'daily'
      }
    });
    return res.data.prices.map((p: [number, number]) => ({
      timestamp: p[0],
      price: p[1]
    }));
  } catch (err) {
    return [];
  }
};

export const getTopMarkets = async (page: number = 1, perPage: number = 20) => {
  const res = await api.get('/api/market/top-coins', {
    params: { page, perPage }
  });
  return res.data;
};

export const getMarketStatus = async () => {
  const res = await api.get('/api/market/status');
  return res.data;
};

export const analyzeScamToken = async (token: string) => {
  const res = await api.get('/api/scam/check', { params: { token } });
  return res.data;
};

export const getAllocationAnalytics = async () => {
  const res = await api.get('/api/analytics/allocation');
  return res.data;
};

export const getHealthScore = async () => {
  const res = await api.get('/api/analytics/health-score');
  return res.data;
};

export const exportReportsCsv = async () => {
  const res = await api.get('/api/reports/export/csv', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `portfolio_export_${date}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
};

export const exportReportsPdf = async () => {
  const res = await api.get('/api/reports/export/pdf', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `crypto_report_${date}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
};

export const exportRiskPdf = async () => {
  const res = await api.get('/api/reports/export/risk/pdf', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `risk_report_${date}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
};

export const exportMarketPdf = async () => {
  const res = await api.get('/api/reports/export/market/pdf', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `market_report_${date}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
};

export const analyzeAssetRisk = async (symbol: string) => {
  const res = await api.get('/api/risk/analyze', { params: { symbol } });
  return res.data;
};

export const getGlobalRisk = async () => {
  const res = await api.get('/risk/global');
  return res.data;
};

export const getPersonalRisk = async () => {
  const res = await api.get('/risk/personal');
  return res.data;
};

export const getWatchlist = async () => {
  const res = await api.get('/api/watchlist');
  return res.data;
};

export const addToWatchlist = async (symbol: string) => {
  const res = await api.post('/api/watchlist', { symbol });
  return res.data;
};

export const removeFromWatchlist = async (symbol: string) => {
  const res = await api.delete(`/api/watchlist/${symbol}`);
  return res.data;
};

export const getMarketSentiment = async () => {
  const res = await api.get('/market/sentiment');
  return res.data;
};


// Reports APIs (Consolidated)
export const downloadPortfolioCsv = async () => {
  const res = await api.get('/reports/portfolio/csv', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'portfolio.csv');
  document.body.appendChild(link);
  link.click();
};

export const downloadPortfolioPdf = async () => {
  const res = await api.get('/reports/portfolio/pdf', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'portfolio.pdf');
  document.body.appendChild(link);
  link.click();
};

export const downloadRiskPdf = async () => {
  const res = await api.get('/reports/risk/pdf', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'risk_analysis.pdf');
  document.body.appendChild(link);
  link.click();
};

// P&L & Tax APIs (Global & Personal)
export const getGlobalPnlSummary = async () => {
  const res = await api.get('/api/pnl/global/summary');
  return res.data;
};

export const getPersonalPnlSummary = async () => {
  const res = await api.get('/api/pnl/personal/summary');
  return res.data;
};

export const exportGlobalPnlCsv = async () => {
  const res = await api.get('/api/pnl/global/export/csv', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'pnl_global.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportPersonalPnlCsv = async () => {
  const res = await api.get('/api/pnl/personal/export/csv', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'pnl_personal.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getGlobalTaxSummary = async (financialYear?: string) => {
  const params = financialYear ? { financialYear } : {};
  const res = await api.get('/api/tax/global/summary', { params });
  return res.data;
};

export const getPersonalTaxSummary = async (financialYear?: string) => {
  const params = financialYear ? { financialYear } : {};
  const res = await api.get('/api/tax/personal/summary', { params });
  return res.data;
};

export const exportGlobalTaxCsv = async (financialYear?: string) => {
  const params = financialYear ? { financialYear } : {};
  const res = await api.get('/api/tax/global/export/csv', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'tax_global.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportPersonalTaxCsv = async () => {
  const res = await api.get('/api/tax/personal/export/csv', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'tax_personal.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



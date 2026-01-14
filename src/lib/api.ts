const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "cg_token";

export interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string; createdAt?: string };
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

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const withAuth = (init: RequestInit = {}) => {
  const token = getToken();
  return {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
};

export const register = (body: { name: string; email: string; password: string }) =>
  apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const login = (body: { email: string; password: string }) =>
  apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const logout = () =>
  apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
    ...withAuth({}),
  });

export const fetchMe = () =>
  apiFetch<{ id: string; name: string; email: string; createdAt?: string }>("/auth/me", withAuth());

export const fetchHoldings = () =>
  apiFetch<{ items: any[] }>("/holdings", withAuth());

export const fetchTrades = () =>
  apiFetch<{ items: any[] }>("/trades", withAuth());

export const fetchAlerts = () =>
  apiFetch<{ items: any[] }>("/alerts", withAuth());

export const fetchExchanges = () =>
  apiFetch<{ items: any[] }>("/exchanges", withAuth());

export const connectExchange = (body: { id: string; apiKey: string; apiSecret: string }) =>
  apiFetch("/exchanges/connect", {
    method: "POST",
    ...withAuth({
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  });

export const disconnectExchange = (id: string) =>
  apiFetch(`/exchanges/disconnect/${id}`, {
    method: "POST",
    ...withAuth(),
  });

export const fetchSettings = () =>
  apiFetch<{
    profile: { name: string; email: string; phone?: string; timezone?: string };
    notifications: { email: boolean; push: boolean; priceAlerts: boolean; riskAlerts: boolean };
    appearance: { darkMode: boolean };
  }>("/settings", withAuth());

export const updateSettings = (body: any) =>
  apiFetch("/settings", {
    method: "PUT",
    ...withAuth({
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  });

export const fetchLatestPrices = () =>
  apiFetch<{ items: any[] }>("/prices/latest", withAuth());

export const fetchPriceHistory = (symbol: string, days: number = 30) =>
  apiFetch<{ items: any[] }>(`/prices/history/${symbol}?days=${days}`, withAuth());

export const checkContractRisk = (body: { address: string; symbol?: string }) =>
  apiFetch("/risk/check", {
    method: "POST",
    ...withAuth({
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  });

export const fetchNotifications = () =>
  apiFetch<{ items: any[] }>("/notifications", withAuth());

export const fetchUnreadNotifications = () =>
  apiFetch<{ count: number }>("/notifications/unread", withAuth());

export const markNotificationRead = (id: string) =>
  apiFetch(`/notifications/${id}/read`, {
    method: "PATCH",
    ...withAuth(),
  });

export const markAllNotificationsRead = () =>
  apiFetch("/notifications/read-all", {
    method: "PATCH",
    ...withAuth(),
  });

export const deleteNotification = (id: string) =>
  apiFetch(`/notifications/${id}`, {
    method: "DELETE",
    ...withAuth(),
  });

export const addHolding = (body: {
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
  color?: string;
}) =>
  apiFetch<Holding>("/holdings", {
    method: "POST",
    ...withAuth({
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  });

export const deleteHolding = (symbol: string) =>
  apiFetch(`/holdings/${symbol}`, {
    method: "DELETE",
    ...withAuth(),
  });


import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { clearToken, fetchMe, login, logout, register, setToken } from "@/lib/api";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface AuthContextShape {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  useEffect(() => {
    const init = async () => {
      try {
        const me = await fetchMe();
        setUser(me);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const value = useMemo<AuthContextShape>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const res = await login({ email, password });
        setToken(res.token);
        setUser(res.user);
        qc.clear();
      },
      register: async (name, email, password) => {
        const res = await register({ name, email, password });
        setToken(res.token);
        setUser(res.user);
        qc.clear();
      },
      logout: async () => {
        try {
          await logout();
        } catch {
          // ignore network/logout errors
        }
        clearToken();
        setUser(null);
        qc.clear();
      },
    }),
    [user, loading, qc],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};


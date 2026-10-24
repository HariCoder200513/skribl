import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMe } from '../api';

type User = { id: string; username: string; email: string };

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('skribl_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await getMe(token);
        setUser(me);
      } catch (e) {
        console.error('Failed to load user:', e);
        localStorage.removeItem('skribl_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const login = (t: string) => {
    localStorage.setItem('skribl_token', t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem('skribl_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

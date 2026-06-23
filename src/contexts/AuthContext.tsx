import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { authService } from '../services/authService';
import { setToken } from '../services/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'auth_token';

// SecureStore não funciona na web — usa localStorage como fallback
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    await SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    await SecureStore.deleteItemAsync(key);
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage.getItem(TOKEN_KEY).then(async (stored) => {
      if (stored) {
        setToken(stored);
        setTokenState(stored);
        try {
          const me = await authService.me();
          setUser(me);
        } catch {
          await storage.deleteItem(TOKEN_KEY);
        }
      }
      setIsLoading(false);
    });
  }, []);

  async function login(email: string, password: string) {
    const { token: t, user: u } = await authService.login({ email, password });
    await storage.setItem(TOKEN_KEY, t);
    setToken(t);
    setTokenState(t);
    setUser(u);
  }

  async function register(name: string, email: string, password: string) {
    const { token: t, user: u } = await authService.register({ name, email, password });
    await storage.setItem(TOKEN_KEY, t);
    setToken(t);
    setTokenState(t);
    setUser(u);
  }

  async function logout() {
    await storage.deleteItem(TOKEN_KEY);
    setToken(null);
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}

"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { api, type TokenPair, type User } from "@/lib/api";
import {
  clearAuthSession,
  getStoredTokens,
  getStoredUser,
  saveAuthSession,
  saveCurrentUser,
} from "@/lib/auth";

type AuthContextValue = {
  tokens: TokenPair | null;
  user: User | null;
  isReady: boolean;
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string, role: "buyer" | "creator"): Promise<void>;
  logout(): Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<TokenPair | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedTokens = getStoredTokens();
    const storedUser = getStoredUser();
    setTokens(storedTokens);
    setUser(storedUser);
    setIsReady(true);

    if (storedTokens) {
      api.auth
        .me(storedTokens.access_token)
        .then((freshUser) => {
          setUser(freshUser);
          saveCurrentUser(freshUser);
        })
        .catch(() => {
          clearAuthSession();
          setTokens(null);
          setUser(null);
        });
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      tokens,
      user,
      isReady,
      async login(email, password) {
        const nextTokens = await api.auth.login({ email, password });
        const nextUser = await api.auth.me(nextTokens.access_token);
        saveAuthSession(nextTokens, nextUser);
        setTokens(nextTokens);
        setUser(nextUser);
      },
      async register(email, password, role) {
        await api.auth.register({ email, password, role });

        try {
          const nextTokens = await api.auth.login({ email, password });
          const nextUser = await api.auth.me(nextTokens.access_token);
          saveAuthSession(nextTokens, nextUser);
          setTokens(nextTokens);
          setUser(nextUser);
        } catch (error) {
          const fallbackUser = {
            id: "",
            email,
            roles: [role] as Array<"buyer" | "creator" | "admin">,
            is_active: true,
            email_verified: false,
            created_at: new Date().toISOString(),
          };
          saveCurrentUser(fallbackUser);
          setUser(fallbackUser);
          throw error;
        }
      },
      async logout() {
        if (tokens) {
          await api.auth.logout(tokens.access_token, tokens.refresh_token).catch(() => undefined);
        }
        clearAuthSession();
        setTokens(null);
        setUser(null);
      },
    }),
    [isReady, tokens, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

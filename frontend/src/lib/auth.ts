import type { TokenPair, User } from "./api";

const TOKENS_KEY = "digimart.tokens";
const USER_KEY = "digimart.user";

export function saveAuthSession(tokens: TokenPair, user?: User): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function saveCurrentUser(user: User): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredTokens(): TokenPair | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(TOKENS_KEY);
  return raw ? (JSON.parse(raw) as TokenPair) : null;
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(TOKENS_KEY);
  window.localStorage.removeItem(USER_KEY);
}

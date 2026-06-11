import React, { createContext, useContext, useState, useCallback } from 'react';

export const AUTH_EMAIL_KEY = 'domex_auth_email';
export const HAS_ACCOUNTS_KEY = 'domex_has_accounts';
const SNAPSHOT_PREFIX = 'domex_snapshot_';

// All keys to save/restore per user session
export const USER_DATA_KEYS = [
  'domex_tareas', 'domex_ideas', 'domex_transacciones', 'domex_agenda',
  'domex_noticias_leidas', 'domex_market_cache', 'domex_mensajes', 'domex_habitos',
  'domex_contactos', 'domex_daily_scores', 'domex_learning_categories',
  'domex_learning_lessons', 'domex_meals', 'domex_memory', 'domex_energy',
  'domex_hormone', 'domex_energy_balance', 'domex_learning_paths', 'domex_podcasts',
  'domex_books', 'domex_wisdom', 'domex_debates', 'domex_decisions',
  'domex_blind_spots', 'domex_accountability', 'domex_legacy',
  'domex_profile', 'domex_tour_done',
];

export function hashPassword(password: string): string {
  return btoa(encodeURIComponent(password));
}

function saveSnapshot(email: string) {
  const snapshot: Record<string, string> = {};
  USER_DATA_KEYS.forEach(key => {
    const val = localStorage.getItem(key);
    if (val !== null) snapshot[key] = val;
  });
  localStorage.setItem(`${SNAPSHOT_PREFIX}${email}`, JSON.stringify(snapshot));
}

function clearUserData() {
  USER_DATA_KEYS.forEach(key => localStorage.removeItem(key));
}

function restoreSnapshot(email: string): boolean {
  const raw = localStorage.getItem(`${SNAPSHOT_PREFIX}${email}`);
  if (!raw) return false;
  clearUserData();
  try {
    const snapshot = JSON.parse(raw) as Record<string, string>;
    Object.entries(snapshot).forEach(([key, val]) => localStorage.setItem(key, val));
    return true;
  } catch {
    return false;
  }
}

type LoginResult = 'ok' | 'no_user' | 'wrong_password';

interface AuthContextType {
  email: string | null;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  hasAccounts: () => boolean;
  accountExists: (email: string) => boolean;
  saveCurrentSnapshot: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(() =>
    localStorage.getItem(AUTH_EMAIL_KEY)
  );

  const login = useCallback((inputEmail: string, password: string): LoginResult => {
    const normalizedEmail = inputEmail.trim().toLowerCase();
    const snapshotRaw = localStorage.getItem(`${SNAPSHOT_PREFIX}${normalizedEmail}`);
    if (!snapshotRaw) return 'no_user';

    // Verify password from stored profile in snapshot
    try {
      const snapshot = JSON.parse(snapshotRaw);
      const profileStr = snapshot['domex_profile'];
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        const stored = profile.identity?.passwordHash;
        if (stored && stored !== hashPassword(password)) return 'wrong_password';
      }
    } catch { /* no password set — allow login */ }

    restoreSnapshot(normalizedEmail);
    localStorage.setItem(AUTH_EMAIL_KEY, normalizedEmail);
    setEmail(normalizedEmail);
    return 'ok';
  }, []);

  const logout = useCallback(() => {
    const cur = localStorage.getItem(AUTH_EMAIL_KEY);
    if (cur) saveSnapshot(cur);
    clearUserData();
    localStorage.removeItem(AUTH_EMAIL_KEY);
    localStorage.setItem(HAS_ACCOUNTS_KEY, 'true');
    setEmail(null);
  }, []);

  const saveCurrentSnapshot = useCallback(() => {
    const cur = localStorage.getItem(AUTH_EMAIL_KEY);
    if (cur) saveSnapshot(cur);
  }, []);

  const hasAccounts = useCallback(() =>
    localStorage.getItem(HAS_ACCOUNTS_KEY) === 'true', []);

  const accountExists = useCallback((e: string) =>
    localStorage.getItem(`${SNAPSHOT_PREFIX}${e.trim().toLowerCase()}`) !== null, []);

  return (
    <AuthContext.Provider value={{ email, login, logout, hasAccounts, accountExists, saveCurrentSnapshot }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import type { AuthUser } from '../types/auth.types';

const STORAGE_KEY = 'auth.session.v1';

type AuthSession = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  session: AuthSession | null;
  isRestoring: boolean;
  signIn: (token: string, user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function canUseSecureStore() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function readSession(): Promise<AuthSession | null> {
  const useSecure = await canUseSecureStore();
  const raw = useSecure
    ? await SecureStore.getItemAsync(STORAGE_KEY)
    : await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

async function writeSession(session: AuthSession | null): Promise<void> {
  const useSecure = await canUseSecureStore();

  if (!session) {
    if (useSecure) {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
    return;
  }

  const raw = JSON.stringify(session);
  if (useSecure) {
    await SecureStore.setItemAsync(STORAGE_KEY, raw);
  } else {
    await AsyncStorage.setItem(STORAGE_KEY, raw);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [isRestoring, setIsRestoring] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const restored = await readSession();
        if (!cancelled) setSession(restored);
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = React.useCallback(async (token: string, user: AuthUser) => {
    const next: AuthSession = { token, user };
    setSession(next);
    await writeSession(next);
  }, []);

  const signOut = React.useCallback(async () => {
    setSession(null);
    await writeSession(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ session, isRestoring, signIn, signOut }),
    [session, isRestoring, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthSession debe usarse dentro de <AuthProvider />');
  }
  return ctx;
}

export default AuthProvider;

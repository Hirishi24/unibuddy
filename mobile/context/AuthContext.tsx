import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Profile } from '../types';
import { GUEST_DATA } from '../lib/guestData';

interface Session {
  accessToken: string;
  sessionId?: string;
  sessionTime?: string;
}

interface AuthContextValue {
  isLoggedIn: boolean;
  isGuest: boolean;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  login: (session: Session, profile?: Profile) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const KEYS = {
  SESSION: 'unibuddy_session',
  GUEST: 'unibuddy_guest',
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const guestFlag = await SecureStore.getItemAsync(KEYS.GUEST);
        if (guestFlag === 'true') {
          setIsGuest(true);
          setProfile(GUEST_DATA.profile);
          setLoading(false);
          return;
        }
        const stored = await SecureStore.getItemAsync(KEYS.SESSION);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSession(parsed.session);
          setProfile(parsed.profile || null);
        }
      } catch (_) {}
      setLoading(false);
    };
    restore();
  }, []);

  const login = useCallback(async (s: Session, p?: Profile) => {
    setSession(s);
    setProfile(p || null);
    setIsGuest(false);
    await SecureStore.setItemAsync(KEYS.GUEST, 'false');
    await SecureStore.setItemAsync(KEYS.SESSION, JSON.stringify({ session: s, profile: p }));
  }, []);

  const loginAsGuest = useCallback(async () => {
    setSession(null);
    setIsGuest(true);
    setProfile(GUEST_DATA.profile);
    await SecureStore.setItemAsync(KEYS.GUEST, 'true');
    await SecureStore.deleteItemAsync(KEYS.SESSION).catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    setSession(null);
    setIsGuest(false);
    setProfile(null);
    await SecureStore.deleteItemAsync(KEYS.SESSION).catch(() => {});
    await SecureStore.setItemAsync(KEYS.GUEST, 'false');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!session || isGuest,
        isGuest,
        session,
        profile,
        loading,
        login,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

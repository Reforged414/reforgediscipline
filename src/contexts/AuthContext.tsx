import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp, type URLOpenListenerEvent } from '@capacitor/app';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isGuest: false,
  loading: true,
  signOut: async () => {},
  continueAsGuest: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('reforged-guest') === 'true');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // If the user was in guest mode and has meaningful local progress,
        // flag a pending transfer so we can prompt before cloud sync overwrites it.
        const wasGuest = localStorage.getItem('reforged-guest') === 'true';
        if (wasGuest) {
          const s = useAppStore.getState();
          const hasProgress =
            s.streak > 0 ||
            s.xp > 0 ||
            s.urgeLogs.length > 0 ||
            s.relapseLogs.length > 0 ||
            s.journalLogs.length > 0;
          if (hasProgress) {
            localStorage.setItem('reforged-pending-transfer', 'true');
          }
        }
        setIsGuest(false);
        localStorage.removeItem('reforged-guest');
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let handle: { remove: () => Promise<void> } | undefined;

    CapacitorApp.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
      try {
        const url = event.url;
        if (!url || !url.includes('auth/callback')) return;

        // Parse params from either query string or fragment (Supabase uses both depending on flow).
        const parsed = new URL(url);
        const search = parsed.search.startsWith('?') ? parsed.search.slice(1) : parsed.search;
        const hash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash;
        const params = new URLSearchParams(search || hash);

        const code = params.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data.session) setSession(data.session);
          return;
        }

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (data.session) setSession(data.session);
          return;
        }

        // Fallback: pick up whatever session is now available.
        const { data: { session } } = await supabase.auth.getSession();
        if (session) setSession(session);
      } catch (err) {
        console.error('OAuth deep-link handling failed', err);
      }
    }).then((h) => { handle = h; });

    return () => {
      handle?.remove();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsGuest(false);
    localStorage.removeItem('reforged-guest');
  };

  const continueAsGuest = () => {
    // Fully isolate: wipe any prior store state (e.g. from a previously signed-in account on this device)
    useAppStore.getState().resetAllLocalData();
    setIsGuest(true);
    localStorage.setItem('reforged-guest', 'true');
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isGuest, loading, signOut, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

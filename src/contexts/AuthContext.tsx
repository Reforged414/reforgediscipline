import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsGuest(false);
    localStorage.removeItem('reforged-guest');
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('reforged-guest', 'true');
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isGuest, loading, signOut, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

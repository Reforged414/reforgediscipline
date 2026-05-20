import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';

export default function LoginScreen() {
  // 1. Initialize the native Google plugin on mount
  useEffect(() => {
    const initGoogle = async () => {
      try {
        await GoogleSignIn.initialize({
          clientId: '901513190581-kebnm9ij83851i249b10mk286gi2r0ov.apps.googleusercontent.com',
        });
        console.log('Native Google Sign-In Initialized');
      } catch (err) {
        console.error('Plugin initialization warning:', err);
      }
    };
    initGoogle();
  }, []);

  // 2. The single, clean login handler
  const handleGoogleSignIn = async () => {
    try {
      const result = await GoogleSignIn.signIn();
      console.log('Google User Data:', result);
      
      const idToken = result.idToken;
      
      if (idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) throw error;
        console.log('Supabase native session created:', data);
      }
    } catch (error) {
      console.error('Google native sign in failed:', error);
      alert('Native Error: ' + (error?.message || JSON.stringify(error)));
    }
  };

  // 3. Your complete visual design layout
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="rounded-2xl bg-primary/10 p-4 text-primary">
            <Flame className="h-12 w-12 text-orange-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Reforged Discipline</h1>
          <p className="text-sm text-muted-foreground">
            Forge your mind. Control your actions.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-input bg-card px-4 py-3.5 text-sm font-semibold shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-98"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
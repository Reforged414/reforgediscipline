import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';

export default function LoginScreen() {
  const handleGoogleSignIn = async () => {
    try {
      // 1. Trigger the native Google overlay
      const result = await GoogleSignIn.signIn();
      console.log('Google User Data:', result);
      
      // 2. Grab the token Google gives us
      const idToken = result.idToken;
      
      if (idToken) {
        // 3. Log into Supabase natively using the ID token
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) throw error;
        console.log('Supabase session started:', data);
      }
    } catch (error) {
      console.error('Google sign in failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Your actual Login Screen design elements (buttons, layout) go here */}
      <button 
        onClick={handleGoogleSignIn}
        className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Sign in with Google
      </button>
    </div>
  );
}
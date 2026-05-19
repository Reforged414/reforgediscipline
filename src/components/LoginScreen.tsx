import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react'; // Added useEffect
import { Capacitor } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';

export default function LoginScreen() {
  
  // Initialize the native plugin when the login screen loads
  useEffect(() => {
    const initGoogle = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await GoogleSignIn.initialize({
            // Android uses your WEB client ID to talk to the native Credential Manager
            clientId: '901513190581-kebnm9ij83851i249b10mk286gi2r0ov.apps.googleusercontent.com',
          });
          console.log('Native Google Sign-In Initialized Successfully');
        } catch (err) {
          console.error('Failed to initialize native Google Sign-In:', err);
        }
      }
    };
    
    initGoogle();
  }, []);
// Initialize the native plugin when the login screen loads
  useEffect(() => {
    const initGoogle = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await GoogleSignIn.initialize({
            // Your Web Client ID tells Android how to safely register the native credential prompt
            clientId: '901513190581-kebnm9ij83851i249b10mk286gi2r0ov.apps.googleusercontent.com',
          });
          console.log('Native Google Sign-In Initialized Successfully');
        } catch (err) {
          console.error('Failed to initialize native Google Sign-In:', err);
        }
      }
    };
    
    initGoogle();
  }, []);
  
  const handleGoogleSignIn = async () => {
    try {
      // 1. Trigger the native Google prompt overlay (no browser!)
      const result = await GoogleSignIn.signIn();
      console.log('Google User Data:', result);
      
      // 2. Grab the native token
      const idToken = result.idToken;
      
      if (idToken) {
        // 3. Authenticate with Supabase completely silently
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) throw error;
        console.log('Supabase native session created:', data);
      }
    } catch (error) {
      console.error('Google native sign in failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {}
      <button 
        onClick={handleGoogleSignIn}
        className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Sign in with Google
      </button>
    </div>
  );
}
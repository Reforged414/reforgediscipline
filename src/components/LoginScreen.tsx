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
        // TODO: Send this idToken to your backend (Firebase, Supabase, Node, etc.)
        console.log("Token received, ready to authenticate:", idToken);
      }
      
    } catch (error) {
      console.error('Google Sign In Failed:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Your other login UI elements */}
      
      <button 
        onClick={handleGoogleSignIn}
        className="px-4 py-2 bg-white text-black border rounded-md shadow-md hover:bg-gray-100"
      >
        Sign in with Google
      </button>
    </div>
  );
}


import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const LoginScreen = () => {
  const { continueAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);

 const handleGoogleSignIn = async () => {
  setLoading(true);
  try {
    console.log('Starting Google Sign In...');
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://fpqezkuhwkazzzqrhofu.supabase.co/auth/v1/callback',
      },
    });
    console.log('Result:', data, error);
    if (error) {
      console.error('Sign in error:', error);
      alert('Error: ' + error.message);
    }
  } catch (err) {
    console.error('Sign in failed:', err);
    alert('Failed: ' + err);
  } finally {
    setLoading(false);
  }
};
return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        className="w-full max-w-sm flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Flame size={36} className="text-primary" />
        </motion.div>

        <h1 className="font-display text-3xl tracking-widest text-primary mb-1">REFORGED</h1>
        <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase mb-12">
          Break free. Rebuild stronger.
        </p>

        <motion.button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-foreground/95 flex items-center justify-center gap-3 mb-4"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
          </svg>
          <span className="text-background font-medium text-sm">
            {loading ? 'Signing in...' : 'Continue with Google'}
          </span>
        </motion.button>

        <div className="flex items-center gap-3 w-full my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-xs tracking-wider uppercase">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <motion.button
          onClick={continueAsGuest}
          className="w-full py-4 rounded-xl border border-border text-foreground font-display text-sm tracking-wider"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          CONTINUE AS GUEST
        </motion.button>

        <motion.p
          className="text-muted-foreground text-[10px] tracking-wider text-center mt-6 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.6 }}
        >
          Guest data is stored locally and may be lost. Sign in to save your progress.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
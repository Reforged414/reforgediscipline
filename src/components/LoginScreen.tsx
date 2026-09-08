import { motion } from 'framer-motion';
import { Flame, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

interface LoginScreenProps {
  onBack?: () => void;
  onSignedIn?: () => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

const AppleLogo = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.3 7.31c1.25.07 2.17.67 2.92.72 1.13-.23 2.2-.89 3.43-.8 1.45.11 2.53.64 3.25 1.62-2.9 1.76-2.2 5.6.48 6.72-.57 1.5-1.31 2.99-2.33 4.71zM12.03 7.25c-.15-2.55 2.11-4.69 4.59-4.75.19 2.82-2.39 5.05-4.59 4.75z" />
  </svg>
);

const GoogleLogo = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function LoginScreen({ onBack, onSignedIn }: LoginScreenProps = {}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      if (validationError.includes('email')) emailRef.current?.focus();
      else passwordRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      onSignedIn?.();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(err?.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter your email address to reset your password.');
      emailRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      setResetSent(true);
      toast('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      setError(err?.message || 'Unable to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (!result.redirected) {
        onSignedIn?.();
      }
    } catch (err: any) {
      console.error(`${provider} sign-in error:`, err);
      setError(err?.message || `Unable to sign in with ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-md space-y-8"
      >
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/40 blur-3xl scale-150" aria-hidden="true" />
            <div className="relative rounded-2xl bg-primary/10 p-4 text-primary">
              <Flame className="h-12 w-12 text-orange-500 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-4xl tracking-wider text-foreground uppercase">
              Reforged Discipline
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back. Sign in to continue your streak.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                placeholder="you@example.com"
                className="flex h-11 w-full rounded-xl border border-border/60 bg-secondary/60 pl-10 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus-visible:border-primary/50 focus-visible:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                placeholder="••••••••"
                className="flex h-11 w-full rounded-xl border border-border/60 bg-secondary/60 pl-10 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus-visible:border-primary/50 focus-visible:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                disabled={loading}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-sm text-primary/80 hover:text-primary transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-destructive"
            >
              {error}
            </motion.p>
          )}

          {resetSent && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-success"
            >
              Reset email sent. Check your inbox.
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
            whileTap={{ scale: 0.97 }}
          >
            {loading ? 'Signing in...' : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            onClick={() => handleOAuth('apple')}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-all hover:bg-foreground/90 active:scale-[0.98] disabled:opacity-60"
          >
            <AppleLogo />
            Apple
          </motion.button>
          <motion.button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-sm font-semibold text-foreground transition-all hover:bg-secondary/80 active:scale-[0.98] disabled:opacity-60"
          >
            <GoogleLogo />
            Google
          </motion.button>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            ← Back to welcome
          </button>
        )}
      </motion.div>
    </div>
  );
}

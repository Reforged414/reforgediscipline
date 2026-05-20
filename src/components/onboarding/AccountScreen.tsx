import { useState } from 'react';
import { motion } from 'framer-motion';
import OnboardingHeader from './OnboardingHeader';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  step: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
}

const AccountScreen = ({ step, total, onBack, onNext }: Props) => {
  const { continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const validate = () => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      // Auto-confirm is on — session is established immediately. Continue the flow.
      onNext();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <OnboardingHeader step={step} total={total} onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <h1 className="text-3xl font-bold text-foreground text-center mb-1">
          Create your
        </h1>
        <h1 className="text-3xl font-bold text-primary text-center mb-8">
          account
        </h1>

        <form onSubmit={handleSignUp} className="w-full max-w-xs space-y-4">
          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-password" className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={loading}
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

          {message && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-green-500"
            >
              {message}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm transition-all hover:bg-primary/90"
            whileTap={{ scale: 0.97 }}
          >
            {loading ? 'Creating account...' : (
              <>
                Create Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </form>

        <p className="text-muted-foreground text-xs my-6 tracking-widest uppercase">or</p>

        <motion.button
          onClick={handleGuest}
          className="w-full max-w-xs flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-primary"
          style={{ background: 'linear-gradient(135deg, hsl(25 95% 53%), hsl(30 100% 60%))' }}
          whileTap={{ scale: 0.97 }}
        >
          <User size={18} className="text-primary-foreground" />
          <span className="text-primary-foreground text-sm font-medium">Continue as Guest</span>
        </motion.button>
      </div>
      <div className="text-center pb-8 px-8">
        <p className="text-muted-foreground text-xs">
          By signing up, you agree to our{' '}
          <span className="text-primary underline">Terms of Service</span> and{' '}
          <span className="text-primary underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default AccountScreen;

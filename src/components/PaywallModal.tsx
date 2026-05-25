import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, Infinity as InfinityIcon, Brain, BarChart3, Flame, Sparkles, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import {
  setMockPremium,
  fetchOfferingPackages,
  purchasePackage,
  restorePurchases,
} from '@/hooks/usePremium';
import { toast } from 'sonner';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional title context, e.g. "Unlock unlimited goals" */
  reason?: string;
  /** Extra feature bullets to highlight (e.g. Shield blocker) — rendered first. */
  extraFeatures?: { label: string; desc: string }[];
}

type Plan = 'annual' | 'monthly';

const BASE_FEATURES = [
  { icon: InfinityIcon, label: 'Unlimited Discipline Goals', desc: 'Build the life you want, no limits.' },
  { icon: Brain, label: 'AI Trigger Analysis', desc: 'Understand the patterns behind your urges.' },
  { icon: BarChart3, label: 'Weekly Recovery Insights', desc: 'See your progress, week after week.' },
];

const PaywallModal = ({ open, onClose, reason, extraFeatures = [] }: PaywallModalProps) => {
  const [plan, setPlan] = useState<Plan>('annual');
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [busy, setBusy] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const FEATURES = [
    ...extraFeatures.map((f) => ({ icon: Sparkles, ...f })),
    ...BASE_FEATURES,
  ];

  useEffect(() => {
    if (!open || !isNative) return;
    fetchOfferingPackages().then(setPackages);
  }, [open, isNative]);

  const pickPackage = (): PurchasesPackage | undefined => {
    if (!packages.length) return undefined;
    const want = plan === 'annual' ? 'ANNUAL' : 'MONTHLY';
    return (
      packages.find((p) => p.packageType === want) ??
      packages.find((p) =>
        plan === 'annual'
          ? /annual|year/i.test(p.identifier)
          : /month/i.test(p.identifier),
      ) ??
      packages[0]
    );
  };

  const handlePurchase = async () => {
    if (busy) return;
    if (!isNative) {
      // Web preview fallback — mock-grant premium so the gate unlocks for testing.
      setMockPremium(true);
      onClose();
      return;
    }
    const pkg = pickPackage();
    if (!pkg) {
      toast.error('No subscription packages available. Please try again later.');
      return;
    }
    setBusy(true);
    try {
      const active = await purchasePackage(pkg);
      if (active) {
        toast.success('Premium unlocked — welcome to the inner circle.');
        onClose();
      } else {
        toast.error('Purchase completed but premium is not active yet.');
      }
    } catch (err: any) {
      if (!err?.userCancelled) {
        console.error('[Paywall] purchase failed', err);
        toast.error(err?.message || 'Purchase failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    if (busy) return;
    if (!isNative) {
      setMockPremium(true);
      onClose();
      return;
    }
    setBusy(true);
    try {
      const active = await restorePurchases();
      if (active) {
        toast.success('Purchases restored.');
        onClose();
      } else {
        toast('No active subscription found.');
      }
    } catch (err: any) {
      console.error('[Paywall] restore failed', err);
      toast.error(err?.message || 'Could not restore purchases.');
    } finally {
      setBusy(false);
    }
  };


  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-3xl border-t border-border bg-background"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            style={{
              backgroundImage:
                'radial-gradient(120% 60% at 50% 0%, hsl(25 95% 53% / 0.18), transparent 60%)',
            }}
          >
            <div className="max-w-md mx-auto px-6 pt-5 pb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto" />
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-5 top-5 text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-3">
                  <div className="absolute inset-0 rounded-full bg-primary/40 blur-2xl" />
                  <Flame size={42} className="relative text-primary" strokeWidth={1.5} />
                </div>
                <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-2">
                  Reforged Premium
                </p>
                <h2 className="font-display text-3xl tracking-wide text-foreground">
                  Forge Without Limits
                </h2>
                {reason && (
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs">{reason}</p>
                )}
              </div>

              <div className="space-y-4 mb-7">
                {FEATURES.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">{label}</p>
                      <p className="text-muted-foreground text-xs">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-5">
                <button
                  onClick={() => setPlan('annual')}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    plan === 'annual'
                      ? 'border-primary bg-primary/10 shadow-[0_0_24px_-6px_hsl(25_95%_53%/0.6)]'
                      : 'border-border bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display text-sm tracking-wider text-foreground">ANNUAL</p>
                        <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] tracking-wider uppercase">
                          Save 50%
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1">$29.99/yr · $2.50/mo</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        plan === 'annual' ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                      }`}
                    >
                      {plan === 'annual' && <Check size={12} className="text-primary-foreground" />}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPlan('monthly')}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    plan === 'monthly'
                      ? 'border-primary bg-primary/10 shadow-[0_0_24px_-6px_hsl(25_95%_53%/0.6)]'
                      : 'border-border bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-sm tracking-wider text-foreground">MONTHLY</p>
                      <p className="text-muted-foreground text-xs mt-1">$4.99/mo</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        plan === 'monthly' ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                      }`}
                    >
                      {plan === 'monthly' && <Check size={12} className="text-primary-foreground" />}
                    </div>
                  </div>
                </button>
              </div>

              <motion.button
                onClick={handlePurchase}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl font-display text-lg tracking-wider text-primary-foreground"
                style={{
                  background: 'linear-gradient(135deg, hsl(25 95% 53%), hsl(30 100% 60%))',
                  boxShadow: '0 10px 30px -10px hsl(25 95% 53% / 0.6)',
                }}
              >
                {plan === 'annual' ? 'START — $29.99/yr' : 'START — $4.99/mo'}
              </motion.button>

              <p className="text-center text-[10px] tracking-wider uppercase text-muted-foreground mt-3">
                Cancel anytime · Secure payment
              </p>

              <button
                onClick={handleRestore}
                className="w-full mt-4 text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground"
              >
                Already subscribed? Restore Purchases
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaywallModal;

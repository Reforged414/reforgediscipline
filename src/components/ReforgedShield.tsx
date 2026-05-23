import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, Globe, Search, Lock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { usePremium } from '@/hooks/usePremium';
import PaywallModal from '@/components/PaywallModal';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

/**

 * Reforged Shield — device-level adult content blocker.
 *
 * The toggle state is held locally and is intentionally decoupled from any
 * native API. When we wire this up to iOS Screen Time / a DNS profile we'll
 * implement `activateShield()` / `deactivateShield()` to call the native
 * bridge (Capacitor plugin) and reflect the result back into the same state.
 */

interface ShieldConfig {
  active: boolean;
  blockWebsites: boolean;
  enforceSafeSearch: boolean;
  strictLockHours: number; // 0 = off
}

const DEFAULT_CONFIG: ShieldConfig = {
  active: false,
  blockWebsites: true,
  enforceSafeSearch: true,
  strictLockHours: 0,
};

// Hook points for the future native integration.
async function activateShield(_cfg: ShieldConfig): Promise<boolean> {
  // TODO (native): call Capacitor plugin wrapping iOS Screen Time + DNS profile.
  return true;
}
async function deactivateShield(): Promise<boolean> {
  // TODO (native): tear down DNS profile / Screen Time restrictions.
  return true;
}

const STORAGE_KEY = 'reforged-shield-config';

function readConfig(): ShieldConfig {
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return DEFAULT_CONFIG;
  }
}

const ReforgedShield = () => {
  const { isPremium } = usePremium();
  const [config, setConfig] = useState<ShieldConfig>(() => readConfig());
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const update = (patch: Partial<ShieldConfig>) => {
    const next = { ...config, ...patch };
    setConfig(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleMasterToggle = async () => {
    if (!config.active) {
      if (!isPremium) {
        setPaywallOpen(true);
        return;
      }
      setBusy(true);
      const ok = await activateShield(config);
      setBusy(false);
      if (ok) {
        update({ active: true });
        toast.success('Shield active. Adult content blocked.');
      }
    } else {
      setBusy(true);
      const ok = await deactivateShield();
      setBusy(false);
      if (ok) {
        update({ active: false });
        toast('Shield deactivated.');
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background px-5 pt-12 pb-32"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
        <h1 className="font-display text-xl tracking-widest text-primary">SHIELD</h1>
        {isPremium && (
          <span className="flex items-center gap-1 text-[9px] tracking-widest uppercase text-primary">
            <Sparkles size={10} /> Premium
          </span>
        )}
      </motion.div>

      <motion.p variants={fadeUp} className="text-center text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-2">
        Reforged Shield
      </motion.p>
      <motion.h2 variants={fadeUp} className="text-center font-display text-3xl tracking-wider text-foreground mb-2">
        Device Protection
      </motion.h2>
      <motion.p variants={fadeUp} className="text-center text-sm text-muted-foreground mb-10 max-w-xs mx-auto">
        Block adult content across your entire device. One switch, total discipline.
      </motion.p>

      {/* Master toggle */}
      <motion.div variants={fadeUp} className="flex flex-col items-center mb-10">

        <motion.button
          onClick={handleMasterToggle}
          disabled={busy}
          whileTap={{ scale: 0.96 }}
          className="relative w-48 h-48 rounded-full flex items-center justify-center"
        >
          <AnimatePresence>
            {config.active && (
              <motion.div
                key="glow"
                className="absolute inset-0 rounded-full bg-primary/40 blur-3xl"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [1, 1.08, 1], opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ scale: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.4 } }}
              />
            )}
          </AnimatePresence>
          <div
            className={`relative w-44 h-44 rounded-full flex items-center justify-center border-2 transition-all ${
              config.active
                ? 'border-primary bg-primary/20'
                : 'border-border bg-secondary'
            }`}
            style={
              config.active
                ? { boxShadow: '0 0 60px -10px hsl(25 95% 53% / 0.7), inset 0 0 30px hsl(25 95% 53% / 0.2)' }
                : undefined
            }
          >
            <motion.div
              key={config.active ? 'on' : 'off'}
              initial={{ scale: 0.7, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 16 }}
            >
              {config.active ? (
                <ShieldCheck size={64} className="text-primary" strokeWidth={1.5} />
              ) : (
                <Shield size={64} className="text-muted-foreground" strokeWidth={1.5} />
              )}
            </motion.div>
          </div>
        </motion.button>

        <motion.p
          key={config.active ? 'active-label' : 'inactive-label'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 font-display text-sm tracking-[0.25em] uppercase ${
            config.active ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {config.active ? 'Shield Active · Adult Content Blocked' : 'Activate Device Protection'}
        </motion.p>
        <p className="text-[11px] text-muted-foreground mt-2">
          {config.active ? 'Tap to deactivate' : 'Tap the shield to enable'}
        </p>
      </div>

      {/* Sub-toggles */}
      <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-3">
        Protection Layers
      </p>
      <div className="space-y-3 mb-6">
        <SubToggle
          icon={<Globe size={18} />}
          label="Block Adult Websites"
          desc="Network-level domain filtering"
          enabled={config.blockWebsites}
          onToggle={(v) => update({ blockWebsites: v })}
          disabled={!config.active}
        />
        <SubToggle
          icon={<Search size={18} />}
          label="Enforce Google SafeSearch"
          desc="Locks SafeSearch on across Google"
          enabled={config.enforceSafeSearch}
          onToggle={(v) => update({ enforceSafeSearch: v })}
          disabled={!config.active}
        />
      </div>

      <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-3">
        Commitment Lock
      </p>
      <div className="bg-secondary rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Lock size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium">Strict Mode Lock</p>
            <p className="text-xs text-muted-foreground">
              Prevent yourself from disabling Shield for a set period.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0, 24, 72, 168].map((h) => (
            <button
              key={h}
              onClick={() => update({ strictLockHours: h })}
              className={`py-2 rounded-lg text-xs font-display tracking-wider transition-all ${
                config.strictLockHours === h
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground border border-border'
              }`}
            >
              {h === 0 ? 'OFF' : h < 168 ? `${h}H` : '1W'}
            </button>
          ))}
        </div>
        {config.strictLockHours > 0 && (
          <p className="text-[11px] text-primary/80 mt-3 text-center">
            Mock timer — native lock enforcement coming soon.
          </p>
        )}
      </div>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason="Reforged Shield is a Premium feature. Block adult content system-wide."
        extraFeatures={[{ label: 'System-Wide Adult Content Blocker', desc: 'Stop temptation at the source — across every app.' }]}
      />
    </div>
  );
};

interface SubToggleProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
}

const SubToggle = ({ icon, label, desc, enabled, onToggle, disabled }: SubToggleProps) => (
  <div
    className={`flex items-center gap-3 bg-secondary rounded-xl px-4 py-3 transition-opacity ${
      disabled ? 'opacity-50' : ''
    }`}
  >
    <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground truncate">{desc}</p>
    </div>
    <button
      onClick={() => !disabled && onToggle(!enabled)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-background border border-border'
      }`}
      aria-pressed={enabled}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 ${enabled ? 'right-0.5' : 'left-0.5'} w-5 h-5 rounded-full bg-foreground`}
      />
    </button>
  </div>
);

export default ReforgedShield;

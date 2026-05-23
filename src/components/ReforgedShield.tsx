import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, Globe, Search, Lock, Sparkles, AlertTriangle, X } from 'lucide-react';
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
 * Premium "Iron Lock" rules:
 *  - Activating prompts for a lock duration (24h / 7d / 30d). Until that
 *    duration elapses, the user CANNOT toggle the shield off directly.
 *  - Disabling while locked requires typing an exact accountability phrase
 *    (case-sensitive, paste disabled), which then starts a 12-hour
 *    cooldown. The shield stays fully active during cooldown and
 *    automatically deactivates when the countdown hits zero.
 */

interface ShieldConfig {
  active: boolean;
  blockWebsites: boolean;
  enforceSafeSearch: boolean;
  strictLockHours: number; // legacy quick-pick (informational only)
  lockUntil: number | null; // epoch ms — shield cannot be disarmed before this
  cooldownUntil: number | null; // epoch ms — shield will auto-deactivate at this time
}

const DEFAULT_CONFIG: ShieldConfig = {
  active: false,
  blockWebsites: true,
  enforceSafeSearch: true,
  strictLockHours: 0,
  lockUntil: null,
  cooldownUntil: null,
};

const ACCOUNTABILITY_PHRASE =
  'I am actively choosing to lower my defenses. I accept full responsibility for letting down my guard and delaying my recovery.';
const COOLDOWN_MS = 12 * 60 * 60 * 1000;

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

const LOCK_OPTIONS: { label: string; hours: number }[] = [
  { label: '24 Hours', hours: 24 },
  { label: '7 Days', hours: 24 * 7 },
  { label: '30 Days', hours: 24 * 30 },
];

function formatRemaining(ms: number) {
  if (ms <= 0) return '0s';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

const ReforgedShield = () => {
  const { isPremium } = usePremium();
  const [config, setConfig] = useState<ShieldConfig>(() => readConfig());
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [durationPickerOpen, setDurationPickerOpen] = useState(false);
  const [ironLockOpen, setIronLockOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  // tick clock once per second so countdown UI updates
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // auto-deactivate when cooldown elapses
  useEffect(() => {
    if (config.active && config.cooldownUntil && now >= config.cooldownUntil) {
      (async () => {
        await deactivateShield();
        update({ active: false, lockUntil: null, cooldownUntil: null });
        toast('Cooldown complete. Shield deactivated.');
      })();
    }
  }, [now, config.active, config.cooldownUntil]);

  const update = (patch: Partial<ShieldConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isLocked = !!config.lockUntil && now < config.lockUntil;
  const inCooldown = !!config.cooldownUntil && now < config.cooldownUntil;

  const handleMasterToggle = async () => {
    if (busy) return;
    if (!config.active) {
      if (!isPremium) {
        setPaywallOpen(true);
        return;
      }
      // Premium: ask for Iron Lock duration before activating.
      setDurationPickerOpen(true);
      return;
    }
    // Trying to turn OFF
    if (inCooldown) {
      toast.error('Cooldown active. Shield will deactivate when the timer ends.');
      return;
    }
    if (isLocked) {
      setIronLockOpen(true);
      return;
    }
    // Not locked — straight off
    setBusy(true);
    const ok = await deactivateShield();
    setBusy(false);
    if (ok) {
      update({ active: false, lockUntil: null, cooldownUntil: null });
      toast('Shield deactivated.');
    }
  };

  const confirmActivation = async (hours: number) => {
    setBusy(true);
    const lockUntil = Date.now() + hours * 60 * 60 * 1000;
    const ok = await activateShield({ ...config, active: true, lockUntil });
    setBusy(false);
    if (ok) {
      update({ active: true, lockUntil, cooldownUntil: null, strictLockHours: hours });
      setDurationPickerOpen(false);
      toast.success('Iron Lock engaged. Shield active.');
    }
  };

  const startCooldown = () => {
    update({ cooldownUntil: Date.now() + COOLDOWN_MS });
    setIronLockOpen(false);
    toast('12-hour cooldown started. Shield remains active.');
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
              config.active ? 'border-primary bg-primary/20' : 'border-border bg-secondary'
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

        {/* Iron Lock status pill */}
        {config.active && (isLocked || inCooldown) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-5 px-4 py-2 rounded-full border text-[11px] tracking-widest uppercase flex items-center gap-2 ${
              inCooldown
                ? 'border-destructive/60 bg-destructive/10 text-destructive'
                : 'border-primary/50 bg-primary/10 text-primary'
            }`}
          >
            <Lock size={12} />
            {inCooldown
              ? `Cooldown · ${formatRemaining(config.cooldownUntil! - now)}`
              : `Iron Lock · ${formatRemaining(config.lockUntil! - now)} left`}
          </motion.div>
        )}
      </motion.div>

      {/* Sub-toggles */}
      <motion.p variants={fadeUp} className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-3">
        Protection Layers
      </motion.p>
      <motion.div variants={fadeUp} className="space-y-3 mb-6">
        <SubToggle
          icon={<Globe size={18} />}
          label="Block Adult Websites"
          desc="Network-level domain filtering"
          enabled={config.blockWebsites}
          onToggle={(v) => update({ blockWebsites: v })}
          disabled={!config.active || (config.active && (isLocked || inCooldown))}
        />
        <SubToggle
          icon={<Search size={18} />}
          label="Enforce Google SafeSearch"
          desc="Locks SafeSearch on across Google"
          enabled={config.enforceSafeSearch}
          onToggle={(v) => update({ enforceSafeSearch: v })}
          disabled={!config.active || (config.active && (isLocked || inCooldown))}
        />
      </motion.div>

      <motion.p variants={fadeUp} className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-3">
        Iron Lock
      </motion.p>
      <motion.div variants={fadeUp} className="bg-secondary rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Lock size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium">Commitment Lock</p>
            <p className="text-xs text-muted-foreground">
              Choose a lock duration when you activate the Shield. Disabling early requires a written accountability statement and a 12-hour cooldown.
            </p>
          </div>
        </div>
      </motion.div>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason="Reforged Shield is a Premium feature. Block adult content system-wide."
        extraFeatures={[{ label: 'System-Wide Adult Content Blocker', desc: 'Stop temptation at the source — across every app.' }]}
      />

      <DurationPickerModal
        open={durationPickerOpen}
        onClose={() => !busy && setDurationPickerOpen(false)}
        onConfirm={confirmActivation}
        busy={busy}
      />

      <IronLockOverlay
        open={ironLockOpen}
        onClose={() => setIronLockOpen(false)}
        onConfirm={startCooldown}
        remainingLockMs={config.lockUntil ? config.lockUntil - now : 0}
      />
    </motion.div>
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

// ─── Duration Picker ────────────────────────────────────────────────────────
const DurationPickerModal = ({
  open,
  onClose,
  onConfirm,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (hours: number) => void;
  busy: boolean;
}) => {
  const [selected, setSelected] = useState<number>(24);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl p-6"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg tracking-widest text-primary">IRON LOCK</h3>
              <button onClick={onClose} className="text-muted-foreground" disabled={busy}>
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-foreground mb-1">Choose your lock duration.</p>
            <p className="text-xs text-muted-foreground mb-5">
              Once engaged, the Shield cannot be turned off until this period ends — or until you complete an accountability statement and a 12-hour cooldown.
            </p>
            <div className="space-y-2 mb-6">
              {LOCK_OPTIONS.map((opt) => (
                <button
                  key={opt.hours}
                  onClick={() => setSelected(opt.hours)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    selected === opt.hours
                      ? 'border-primary bg-primary/15 text-foreground'
                      : 'border-border bg-secondary text-muted-foreground'
                  }`}
                >
                  <span className="font-display tracking-wider">{opt.label}</span>
                  <Lock size={16} className={selected === opt.hours ? 'text-primary' : ''} />
                </button>
              ))}
            </div>
            <button
              onClick={() => onConfirm(selected)}
              disabled={busy}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display tracking-widest uppercase disabled:opacity-60"
            >
              {busy ? 'Engaging…' : 'Engage Iron Lock'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Iron Lock Accountability Overlay ───────────────────────────────────────
const IronLockOverlay = ({
  open,
  onClose,
  onConfirm,
  remainingLockMs,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  remainingLockMs: number;
}) => {
  const [typed, setTyped] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) setTyped('');
  }, [open]);

  const matches = typed === ACCOUNTABILITY_PHRASE;

  // Block paste / drop so the user must type each character.
  const blockPaste = (e: React.ClipboardEvent | React.DragEvent) => {
    e.preventDefault();
    toast.error('Pasting is disabled. Type the statement out.');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-3xl border-2 p-6"
            style={{
              borderColor: 'hsl(0 72% 42%)',
              background: 'linear-gradient(180deg, hsl(0 50% 8%) 0%, hsl(0 35% 5%) 100%)',
              boxShadow: '0 0 80px -10px hsl(0 80% 40% / 0.6), inset 0 0 40px hsl(0 80% 40% / 0.1)',
            }}
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2" style={{ color: 'hsl(0 90% 65%)' }}>
                <AlertTriangle size={20} />
                <span className="font-display tracking-[0.3em] text-sm uppercase">Iron Lock Active</span>
              </div>
              <button onClick={onClose} style={{ color: 'hsl(0 60% 70%)' }}>
                <X size={20} />
              </button>
            </div>

            <p className="text-[11px] tracking-widest uppercase mb-2" style={{ color: 'hsl(0 70% 70%)' }}>
              Lock remaining: {formatRemaining(remainingLockMs)}
            </p>
            <h3 className="font-display text-2xl tracking-wider mb-3" style={{ color: 'hsl(0 0% 98%)' }}>
              Are you certain?
            </h3>
            <p className="text-sm mb-5" style={{ color: 'hsl(0 30% 85%)' }}>
              To lower your defenses, type the following statement exactly. Pasting is disabled.
            </p>

            <div
              className="rounded-xl p-4 mb-4 text-sm leading-relaxed"
              style={{
                background: 'hsl(0 40% 10%)',
                border: '1px solid hsl(0 50% 25%)',
                color: 'hsl(0 20% 92%)',
                fontFamily: 'ui-serif, Georgia, serif',
              }}
            >
              “{ACCOUNTABILITY_PHRASE}”
            </div>

            <textarea
              ref={textareaRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onPaste={blockPaste}
              onDrop={blockPaste}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              rows={5}
              placeholder="Type the statement here…"
              className="w-full rounded-xl p-3 text-sm resize-none focus:outline-none"
              style={{
                background: 'hsl(0 30% 6%)',
                border: `1px solid ${matches ? 'hsl(0 80% 55%)' : 'hsl(0 40% 20%)'}`,
                color: 'hsl(0 0% 98%)',
              }}
            />

            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span style={{ color: 'hsl(0 30% 70%)' }}>
                {typed.length}/{ACCOUNTABILITY_PHRASE.length} characters
              </span>
              <span style={{ color: matches ? 'hsl(0 80% 65%)' : 'hsl(0 30% 60%)' }}>
                {matches ? 'Statement verified' : 'Exact match required'}
              </span>
            </div>

            <button
              onClick={onConfirm}
              disabled={!matches}
              className="w-full mt-5 py-3 rounded-xl font-display tracking-widest uppercase transition-all"
              style={{
                background: matches ? 'hsl(0 72% 45%)' : 'hsl(0 30% 18%)',
                color: matches ? 'hsl(0 0% 100%)' : 'hsl(0 20% 55%)',
                cursor: matches ? 'pointer' : 'not-allowed',
                boxShadow: matches ? '0 10px 30px -10px hsl(0 80% 40% / 0.7)' : 'none',
              }}
            >
              Confirm · Start 12h Cooldown
            </button>

            <p className="mt-3 text-[11px] text-center" style={{ color: 'hsl(0 30% 65%)' }}>
              The Shield will remain fully active during the 12-hour cooldown.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReforgedShield;

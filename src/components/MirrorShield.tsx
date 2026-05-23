import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, VideoOff, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface MirrorShieldProps {
  onBack: () => void;
  onDeescalated: () => void;
}

const HOLD_DURATION = 5000;

const MirrorShield = ({ onBack, onDeescalated }: MirrorShieldProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const completedRef = useRef(false);

  const { streak, level, levelName, awardXp } = useAppStore();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera not supported');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e: any) {
        setCameraError(e?.message ?? 'Camera unavailable');
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const playSuccessSound = () => {
    try {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      if (!Ctx) return;
      const ctx = new Ctx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(440, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      o.start();
      o.stop(ctx.currentTime + 0.65);
    } catch {}
  };

  const tick = (t: number) => {
    const elapsed = t - startRef.current;
    const pct = Math.min(1, elapsed / HOLD_DURATION);
    setProgress(pct);
    if (pct >= 1) {
      if (!completedRef.current) {
        completedRef.current = true;
        setSuccess(true);
        playSuccessSound();
        awardXp(30);
        setTimeout(() => onDeescalated(), 1200);
      }
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const startHold = () => {
    if (success) return;
    setHolding(true);
    startRef.current = performance.now() - progress * HOLD_DURATION;
    rafRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    setHolding(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!completedRef.current) {
      // gentle decay
      const decay = () => {
        setProgress((p) => {
          const next = Math.max(0, p - 0.04);
          if (next > 0) rafRef.current = requestAnimationFrame(decay);
          return next;
        });
      };
      rafRef.current = requestAnimationFrame(decay);
    }
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // Circular progress geometry
  const R = 38;
  const C = 2 * Math.PI * R;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 50% 0%, hsl(0 70% 18%) 0%, hsl(0 60% 8%) 40%, hsl(0 0% 4%) 100%)',
      }}
    >
      {/* Heartbeat pulse overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(circle at 50% 30%, hsl(0 80% 40% / 0.4), transparent 60%)' }}
      />

      <div className="relative h-full w-full max-w-md mx-auto flex flex-col px-5 pt-8 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="text-white/80 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft size={22} />
          </button>
          <p className="font-display tracking-[0.35em] text-[10px] text-red-300/80">
            MIRROR SHIELD
          </p>
          <div className="w-5" />
        </div>

        {/* Camera */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-black"
          style={{ outline: '1px solid hsl(0 60% 30% / 0.6)' }}
        >
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 0px 0px hsl(0 90% 50% / 0.0), inset 0 0 20px hsl(0 90% 50% / 0.2)',
                '0 0 40px 6px hsl(0 90% 50% / 0.55), inset 0 0 40px hsl(0 90% 50% / 0.45)',
                '0 0 0px 0px hsl(0 90% 50% / 0.0), inset 0 0 20px hsl(0 90% 50% / 0.2)',
              ],
            }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <AnimatePresence>
            {!success && (
              <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0">
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3 px-6 text-center">
                    <VideoOff size={36} className="text-red-400" />
                    <p className="text-sm">Camera unavailable.</p>
                    <p className="text-xs text-white/50">{cameraError}</p>
                    <p className="text-xs text-white/40 mt-2">Imagine your reflection. Look yourself in the eye.</p>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                )}
                {/* Vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, transparent 50%, hsl(0 0% 0% / 0.7) 100%)' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success overlay */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-3"
              >
                <ShieldCheck size={56} className="text-emerald-400 drop-shadow-[0_0_20px_hsl(150_80%_50%/0.6)]" />
                <p className="font-display text-2xl tracking-[0.2em]">DEFENDED</p>
                <p className="text-xs text-emerald-300 tracking-[0.3em]">+30 XP</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stakes */}
        <div className="flex items-center justify-between mt-3 px-1">
          <div>
            <p className="text-[9px] tracking-[0.3em] text-red-300/70">STREAK</p>
            <p className="font-display text-xl text-white">{streak} <span className="text-xs text-white/50">days</span></p>
          </div>
          <div className="text-right">
            <p className="text-[9px] tracking-[0.3em] text-red-300/70">LVL {level}</p>
            <p className="font-display text-xl text-white">{levelName}</p>
          </div>
        </div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center text-white/85 text-sm leading-relaxed mt-4 px-2"
        >
          Look yourself dead in the eye. You are about to trade your streak and your progress for temporary dopamine.
          <span className="block mt-2 text-red-300 font-semibold">Is the person looking back ready to give up?</span>
        </motion.p>

        <div className="flex-1" />

        {/* Hold button */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <button
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
            disabled={success}
            className="relative w-full h-20 rounded-2xl select-none touch-none active:scale-[0.99] transition-transform"
            style={{
              background: 'linear-gradient(135deg, hsl(0 75% 35%), hsl(0 85% 20%))',
              boxShadow: holding
                ? '0 0 30px hsl(0 90% 50% / 0.7), inset 0 0 30px hsl(0 90% 30% / 0.6)'
                : '0 8px 24px hsl(0 80% 10% / 0.6)',
            }}
          >
            {/* Fill bar */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
            >
              <div
                className="h-full bg-white/15"
                style={{
                  width: `${progress * 100}%`,
                  transition: holding ? 'none' : 'width 0.2s ease-out',
                }}
              />
            </div>
            <div className="relative flex items-center justify-center gap-3 h-full">
              <svg width="44" height="44" viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r={R} stroke="hsl(0 0% 100% / 0.2)" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  stroke="hsl(0 0% 100%)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - progress)}
                  style={{ transition: holding ? 'none' : 'stroke-dashoffset 0.2s ease-out' }}
                />
              </svg>
              <span className="font-display tracking-[0.25em] text-white text-base">
                {success ? 'DEFENDED' : holding ? 'HOLD STEADY...' : 'HOLD TO DE-ESCALATE (5S)'}
              </span>
            </div>
          </button>
          <p className="text-[10px] tracking-[0.3em] text-white/40">
            FIVE SECONDS OF DISCIPLINE • +30 XP
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MirrorShield;

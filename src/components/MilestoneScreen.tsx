import { motion } from 'framer-motion';
import { X, Share2, Flame } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/hooks/use-toast';

interface MilestoneScreenProps {
  milestone: number;
  onContinue: () => void;
}

const MilestoneScreen = ({ milestone, onContinue }: MilestoneScreenProps) => {
  const { streak, resistedTimestamps } = useAppStore();
  const totalUrgesDefeated = resistedTimestamps.length;

  const handleShare = async () => {
    const payload = {
      title: 'Reforged – Milestone Reached',
      text: `I just hit ${milestone} days clean on Reforged! 🔥 Building discipline, one day at a time.`,
      dialogTitle: 'Share your milestone',
    };

    try {
      if (Capacitor.isNativePlatform()) {
        const { value } = await Share.canShare();
        if (value) {
          await Share.share(payload);
          return;
        }
      }
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: payload.title, text: payload.text });
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(payload.text);
        toast({ title: 'Copied to clipboard', description: 'Share it with your crew.' });
      }
    } catch (err: any) {
      if (err?.message && !/cancel/i.test(err.message)) {
        toast({ title: 'Unable to share', description: err.message });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 pt-6 pb-10">
      {/* Top bar */}
      <div className="w-full flex items-center justify-between mb-6">
        <button onClick={onContinue} className="p-2 -ml-2 active:scale-90 transition-transform">
          <X size={22} className="text-muted-foreground" />
        </button>
        <button onClick={handleShare} className="p-2 -mr-2 active:scale-90 transition-transform">
          <Share2 size={20} className="text-muted-foreground" />
        </button>
      </div>

      {/* Title */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="font-display text-xl tracking-wider text-primary italic mb-6"
      >
        Milestone Reached
      </motion.p>

      {/* Big number */}
      <motion.p
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: [0.9, 1.05, 1], opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-8xl font-light text-primary leading-none mb-2"
      >
        {milestone}
      </motion.p>

      {/* Days Clean */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-display text-2xl tracking-wider text-foreground mb-1"
      >
        Days Clean
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground mb-8"
      >
        You're building momentum.
      </motion.p>

      {/* Glowing badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative w-44 h-44 mb-10 flex items-center justify-center"
      >
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Middle ring */}
        <div className="absolute inset-3 rounded-full border-2 border-primary/50" />
        {/* Inner filled circle */}
        <div
          className="absolute inset-6 rounded-full bg-primary flex items-center justify-center"
          style={{ boxShadow: '0 0 40px hsl(25 95% 53% / 0.5), 0 0 80px hsl(25 95% 53% / 0.2)' }}
        >
          <Flame size={40} className="text-primary-foreground" />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="w-full space-y-3 mb-10"
      >
        <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-2">Progress:</p>
        <div className="bg-secondary rounded-xl px-5 py-4 text-center">
          <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-1">Current Streak</p>
          <p className="text-lg text-foreground font-light">{streak} days</p>
        </div>
        <div className="bg-secondary rounded-xl px-5 py-4 text-center">
          <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-1">Total Urges Defeated</p>
          <p className="text-lg text-foreground font-light">{totalUrgesDefeated}</p>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="w-full flex flex-col gap-3">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onContinue}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-base sm:text-lg tracking-wider active:scale-[0.97] transition-transform"
        >
          CONTINUE →
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          onClick={handleShare}
          className="w-full py-3.5 rounded-xl bg-secondary border border-border text-foreground flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          <Share2 size={16} className="text-primary" />
          <span className="font-display tracking-widest uppercase text-xs sm:text-sm">Share Achievement</span>
        </motion.button>
      </div>

    </div>
  );
};

export default MilestoneScreen;

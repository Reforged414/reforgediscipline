import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface JournalEntryProps {
  onBack: () => void;
}

const TAGS = ['Good Day', 'Struggle', 'Win'] as const;

const JournalEntry = ({ onBack }: JournalEntryProps) => {
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { saveJournalEntry } = useAppStore();

  const canSubmit = text.trim().length > 0;

  const handleSave = () => {
    if (!canSubmit) return;
    saveJournalEntry({ text: text.trim(), tag: selectedTag });
    setShowConfirm(true);
    setTimeout(() => onBack(), 1600);
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-10 flex flex-col">
      {/* Header */}
      <button
        onClick={onBack}
        className="self-start mb-6 active:scale-[0.97] transition-transform"
      >
        <ArrowLeft size={22} className="text-muted-foreground" />
      </button>

      <h1 className="font-display text-4xl tracking-wider text-foreground text-center">
        Journal Entry
      </h1>
      <p className="text-muted-foreground text-sm text-center mt-2 mb-10">
        Clear Your Mind, Stay Focused.
      </p>

      {/* Text area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        className="flex-1 min-h-[200px] w-full rounded-2xl border border-border bg-secondary px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none mb-8"
      />

      {/* Tags */}
      <div className="mb-auto">
        <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-3">
          Tag this entry (optional)
        </p>
        <div className="flex gap-3">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-5 py-2 rounded-full text-xs font-display tracking-wider transition-all active:scale-[0.97] ${
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground'
              }`}
            >
              {selectedTag === tag && (
                <span className="mr-1">✓</span>
              )}
              {tag.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="pt-8 pb-4">
        <button
          onClick={handleSave}
          disabled={!canSubmit}
          className="w-full py-4 rounded-xl font-display text-lg tracking-wider text-primary-foreground active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: !canSubmit
              ? 'hsl(25 95% 53% / 0.4)'
              : 'linear-gradient(135deg, hsl(25 95% 53%), hsl(30 100% 60%))',
          }}
        >
          SAVE ENTRY
        </button>
      </div>

      {/* Confirmation overlay */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <p className="font-display text-2xl tracking-wider text-foreground mb-2">
                Entry saved. Keep going.
              </p>
              <p className="text-primary text-lg font-display">+10 XP</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalEntry;

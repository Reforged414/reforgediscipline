import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface JournalEntryProps {
  onBack: () => void;
  onSaved?: () => void;
}

const TAGS = ['Good Day', 'Struggle', 'Win'] as const;

const JournalEntry = ({ onBack, onSaved }: JournalEntryProps) => {
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { saveJournalEntry } = useAppStore();

  const canSubmit = text.trim().length > 0;

  const handleSave = () => {
    if (!canSubmit) return;
    saveJournalEntry({ text: text.trim(), tag: selectedTag });
    if (onSaved) onSaved();
    else onBack();
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
          {TAGS.map((tag) => {
            const isSel = selectedTag === tag;
            return (
              <motion.button
                key={tag}
                onClick={() => setSelectedTag(isSel ? null : tag)}
                whileTap={{ scale: 0.96 }}
                animate={isSel ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`px-5 py-2 rounded-full text-xs font-display tracking-wider ${
                  isSel
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground'
                }`}
              >
                {isSel && <span className="mr-1">✓</span>}
                {tag.toUpperCase()}
              </motion.button>
            );
          })}
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

    </div>
  );
};

export default JournalEntry;

import { useEffect, useState } from 'react';
import { ArrowLeft, Lock, LifeBuoy, X } from 'lucide-react';
import { api } from '@/lib/community';

export const Header = ({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) => (
  <div className="flex items-center gap-3 px-5 pt-6 pb-4 relative z-10">
    {onBack && (
      <button onClick={onBack} aria-label="Back" className="text-foreground p-1"><ArrowLeft size={22} /></button>
    )}
    <h1 className="font-display text-2xl tracking-[0.2em] uppercase text-foreground flex-1 truncate">{title}</h1>
    {right}
  </div>
);

export const SignedImage = ({ path }: { path: string }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { api.imageUrl(path).then(setUrl); }, [path]);
  if (!url) return <div className="w-full aspect-video rounded-xl bg-muted animate-pulse" />;
  return <img src={url} alt="Post attachment" className="w-full rounded-xl object-cover max-h-80" loading="lazy" />;
};

export const CrisisCard = ({ onClose }: { onClose: () => void }) => (
  <div className="rounded-xl border border-primary/30 bg-card p-4 flex gap-3">
    <LifeBuoy size={20} className="text-primary shrink-0 mt-0.5" />
    <div className="flex-1 text-sm">
      <p className="text-foreground font-medium">If you're struggling right now, support is available.</p>
      <p className="text-muted-foreground mt-1">
        In the US, call or text <a href="tel:988" className="text-primary underline">988</a> (Suicide &amp; Crisis Lifeline).
        Elsewhere, find a local line at{' '}
        <a href="https://findahelpline.com" target="_blank" rel="noreferrer" className="text-primary underline">findahelpline.com</a>.
      </p>
    </div>
    <button onClick={onClose} aria-label="Dismiss" className="text-muted-foreground self-start"><X size={16} /></button>
  </div>
);

export const LockedComment = ({ onUnlock }: { onUnlock: () => void }) => (
  <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
    <Lock size={16} className="text-primary" />
    <p className="text-sm text-muted-foreground flex-1">Commenting is a Premium feature</p>
    <button onClick={onUnlock} className="bg-primary text-primary-foreground text-xs font-semibold rounded-lg px-3 py-2">Unlock</button>
  </div>
);

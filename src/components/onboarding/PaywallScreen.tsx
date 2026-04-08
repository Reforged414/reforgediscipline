import { X, Check, Lock, BarChart3, Brain, Target, Trophy } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

const PaywallScreen = ({ onComplete }: Props) => (
  <div className="min-h-screen flex flex-col">
    {/* Header */}
    <div className="relative flex items-center justify-center pt-6 pb-4 px-5">
      <button onClick={onComplete} className="absolute left-5 text-foreground">
        <X size={22} />
      </button>
      <p className="font-display text-lg tracking-widest text-primary">REFORGED</p>
    </div>

    <div className="flex-1 px-5 overflow-y-auto pb-4">
      <div className="text-center mb-6 mt-2">
        <h1 className="text-2xl font-bold text-foreground mb-2">Take Back<br />Control</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Build discipline. Stay consistent.<br />Strengthen your recovery.
        </p>
      </div>

      {/* Free features */}
      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
        What you can do now
      </p>
      <div className="space-y-3 mb-6">
        {['Track your clean streak', 'Log urges and relapses', 'Build discipline with XP and levels'].map((f) => (
          <div key={f} className="flex items-center gap-3">
            <Check size={18} className="text-primary" />
            <span className="text-foreground text-sm">{f}</span>
          </div>
        ))}
      </div>

      {/* Premium */}
      <div className="rounded-xl border border-border bg-secondary p-5 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-primary font-display">
            With Premium Plan
          </p>
          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] tracking-wider uppercase">
            Coming Soon
          </span>
        </div>
        <div className="space-y-4">
          {[
            { icon: BarChart3, label: 'Recovery insights', desc: 'See your patterns and progress.' },
            { icon: Brain, label: 'Trigger analysis', desc: 'Understand what causes urges.' },
            { icon: Target, label: 'Personalized discipline plans', desc: 'Forged for your specific struggle.' },
            { icon: Trophy, label: 'Custom milestones and goals', desc: 'Celebrate every victory, your way.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-3">
                <Icon size={18} className="text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-foreground text-sm font-medium">{item.label}</p>
                  <p className="text-muted-foreground text-xs">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing */}
      <p className="text-muted-foreground text-xs text-center mb-1">
        New features added regularly.
      </p>
      <div className="text-center mb-1">
        <span className="text-3xl font-bold text-foreground">$7.99</span>
        <span className="text-muted-foreground text-sm"> /month</span>
      </div>
      <div className="flex items-center justify-center gap-4 mb-6">
        <p className="text-[10px] tracking-[0.15em] uppercase text-primary">
          7-day free trial included
        </p>
        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
          Cancel anytime
        </p>
      </div>
    </div>

    {/* Buttons */}
    <div className="px-5 pb-6">
      <button
        onClick={onComplete}
        className="w-full py-4 rounded-xl font-display text-lg tracking-wider text-primary-foreground mb-3"
        style={{ background: 'linear-gradient(135deg, hsl(25 95% 53%), hsl(30 100% 60%))' }}
      >
        Continue →
      </button>
      <button
        onClick={onComplete}
        className="w-full py-3 text-center"
      >
        <span className="text-muted-foreground text-xs tracking-widest uppercase">
          Continue with free version
        </span>
      </button>
    </div>
  </div>
);

export default PaywallScreen;

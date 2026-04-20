import { ArrowLeft } from 'lucide-react';

interface Section {
  heading: string;
  body: string | string[];
}

interface Props {
  title: string;
  lastUpdated: string;
  sections: Section[];
  onBack: () => void;
}

const LegalScreen = ({ title, lastUpdated, sections, onBack }: Props) => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6 pb-4 sticky top-0 bg-background z-10 border-b border-border">
        <button onClick={onBack} className="text-foreground p-1" aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-display text-xl tracking-wider text-foreground">{title}</h1>
      </div>

      <div className="px-5 pt-6 max-w-2xl mx-auto">
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-semibold mb-6">
          Last updated: {lastUpdated}
        </p>

        <div className="space-y-6">
          {sections.map((section, idx) => (
            <section key={idx}>
              <h2 className="font-display text-base tracking-wider text-foreground mb-2">
                {idx + 1}. {section.heading}
              </h2>
              {Array.isArray(section.body) ? (
                <ul className="space-y-1.5 pl-4">
                  {section.body.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground leading-relaxed list-disc">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.body}
                </p>
              )}
            </section>
          ))}
        </div>

        <div className="h-px bg-border my-8" />
        <p className="text-xs text-muted-foreground text-center">
          Reforged · Discipline & Recovery
        </p>
      </div>
    </div>
  );
};

export default LegalScreen;

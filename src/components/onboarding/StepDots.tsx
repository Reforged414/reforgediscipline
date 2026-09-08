interface StepDotsProps {
  step: number;
  total: number;
}

const StepDots = ({ step, total }: StepDotsProps) => (
  <div className="flex items-center justify-center gap-2 mt-3">
    {Array.from({ length: total }, (_, i) => {
      const index = i + 1;
      const active = index <= step;
      return (
        <div
          key={index}
          className={`h-2 w-2 rounded-full transition-colors ${
            active
              ? 'bg-primary'
              : 'border border-muted-foreground/40 bg-transparent'
          } ${index === step ? 'ring-2 ring-primary/30' : ''}`}
        />
      );
    })}
  </div>
);

export default StepDots;

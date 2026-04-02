const ComingSoonPlaceholder = ({ title }: { title: string }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pb-24">
      <h2 className="text-2xl font-display uppercase tracking-wider text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-sm">Coming Soon</p>
    </div>
  );
};

export default ComingSoonPlaceholder;

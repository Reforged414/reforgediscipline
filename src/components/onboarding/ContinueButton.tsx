interface ContinueButtonProps {
  label?: string;
  disabled?: boolean;
  onClick: () => void;
}

const ContinueButton = ({ label = 'Continue →', disabled = false, onClick }: ContinueButtonProps) => (
  <div className="px-5 pb-8 pt-4">
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-xl font-display text-lg tracking-wider text-primary-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: disabled
          ? 'hsl(25 95% 53% / 0.4)'
          : 'linear-gradient(135deg, hsl(25 95% 53%), hsl(30 100% 60%))',
      }}
    >
      {label}
    </button>
  </div>
);

export default ContinueButton;

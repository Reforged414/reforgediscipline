import ContinueButton from './ContinueButton';

interface Props {
  onNext: () => void;
}

const FinishScreen = ({ onNext }: Props) => (
  <div className="min-h-screen flex flex-col">
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <h1 className="text-5xl font-serif italic text-foreground text-center leading-tight">
        You're<br />Ready.
      </h1>
    </div>

    <div className="px-5 pb-2">
      <p className="text-muted-foreground text-sm text-center mb-4">
        Your journey starts now.
      </p>
    </div>
    <ContinueButton onClick={onNext} />
  </div>
);

export default FinishScreen;

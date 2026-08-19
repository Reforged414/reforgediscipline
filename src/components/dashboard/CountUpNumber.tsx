import { useEffect, useState } from 'react';

interface CountUpNumberProps {
  value: number;
  duration?: number;
  className?: string;
  onDone?: () => void;
}

/** Eased count-up for big stat numbers (streak, XP). */
const CountUpNumber = ({ value, duration = 800, className, onDone }: CountUpNumberProps) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value <= 0) {
      setDisplay(0);
      onDone?.();
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onDone?.();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span className={className}>{display}</span>;
};

export default CountUpNumber;

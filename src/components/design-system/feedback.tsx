import * as React from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number; // duration in ms
  className?: string;
}

export function AnimatedCounter({ value, duration = 800, className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;

    if (startValue === endValue) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + easeOutCubic * (endValue - startValue));

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span className={className}>{displayValue}</span>;
}

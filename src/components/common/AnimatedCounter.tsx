import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  isLargeNumber?: boolean; // If true, formats e.g. 2400000 as 2.4
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  target, 
  duration = 1500, 
  suffix = "",
  isLargeNumber = false 
}) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          const startTime = performance.now();

          const updateCount = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic for premium deceleration
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeProgress * target);
            
            setCount(current);

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(updateCount);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [target, duration]);

  const formatCount = (val: number) => {
    if (isLargeNumber) {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1);
      }
      if (val >= 1000) {
        return (val / 1000).toFixed(0);
      }
    }
    return val.toLocaleString();
  };

  return (
    <span ref={elementRef} className="tabular-nums">
      {formatCount(count)}
      {suffix}
    </span>
  );
};
export default AnimatedCounter;

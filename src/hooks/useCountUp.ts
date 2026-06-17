"use client";
import { useState, useEffect, useRef } from "react";

interface UseCountUpOptions {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function useCountUp({ target, duration = 2000, prefix = "", suffix = "" }: UseCountUpOptions) {
  const [count, setCount] = useState(0);
  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`);
  const elementRef = useRef<HTMLElement | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            setCount(current);
            setDisplayValue(`${prefix}${current.toLocaleString("ar-LY")}${suffix}`);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(`${prefix}${target.toLocaleString("ar-LY")}${suffix}`);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [target, duration, prefix, suffix]);

  return { count, displayValue, elementRef };
}

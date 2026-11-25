import { useEffect, useState, type CSSProperties, type ComponentType } from 'react';
import { useMotionBudget } from '../motion/useMotionBudget';
import { whenEffectsWarmed } from '../motion/effectsWarmup';
import type { SplitTextProps } from './react-bits/SplitText';

export type AnimatedHeadingProps = {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  textAlign?: CSSProperties['textAlign'];
};

/**
 * AC-22: section headings use vendored React Bits SplitText when effects-on;
 * under the motion fallback budget, render plain accessible text (no stagger).
 * SplitText/gsap stay off the initial-route graph via dynamic import.
 */
export function AnimatedHeading({
  text,
  className = '',
  as = 'h1',
  textAlign = 'left',
}: AnimatedHeadingProps) {
  const budget = useMotionBudget();
  const [Split, setSplit] = useState<ComponentType<SplitTextProps> | null>(null);

  useEffect(() => {
    if (budget !== 'effects-on') {
      setSplit(null);
      return undefined;
    }
    let cancelled = false;
    // Engagement-gated: keeps gsap off the cold-load TBT window (AC-22 still mounts after warm).
    const stop = whenEffectsWarmed(() => {
      import('./react-bits/SplitText').then((mod) => {
        if (!cancelled) setSplit(() => mod.default);
      });
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [budget]);

  const Tag = as;

  if (budget !== 'effects-on' || !Split) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Split
      text={text}
      className={className}
      tag={as}
      textAlign={textAlign}
      trigger="load"
      delay={40}
      duration={0.7}
    />
  );
}

export default AnimatedHeading;

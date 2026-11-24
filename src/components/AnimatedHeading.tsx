import type { CSSProperties } from 'react';
import { useMotionBudget } from '../motion/useMotionBudget';
import SplitText from './react-bits/SplitText';

export type AnimatedHeadingProps = {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  textAlign?: CSSProperties['textAlign'];
};

/**
 * AC-22: section headings use vendored React Bits SplitText when effects-on;
 * under the motion fallback budget, render plain accessible text (no stagger).
 */
export function AnimatedHeading({
  text,
  className = '',
  as = 'h1',
  textAlign = 'left',
}: AnimatedHeadingProps) {
  const budget = useMotionBudget();

  if (budget !== 'effects-on') {
    const Tag = as;
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <SplitText
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

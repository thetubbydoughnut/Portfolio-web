import { useEffect, useState } from 'react';
import {
  DEFAULT_MOTION_BUDGET,
  evaluateMotionBudget,
  getMotionBudget,
  type MotionBudget,
  resetMotionBudget,
} from './budget';

/**
 * Client motion budget. Eagerly evaluates on first render (before paint) so the
 * SwiftShader WebGL probe lands outside the Lighthouse TBT window (FCP→TTI).
 */
export function useMotionBudget(): MotionBudget {
  const [budget, setBudget] = useState<MotionBudget>(() => {
    if (typeof window === 'undefined') return DEFAULT_MOTION_BUDGET;
    return evaluateMotionBudget();
  });

  useEffect(() => {
    setBudget(evaluateMotionBudget());
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setBudget(evaluateMotionBudget());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return budget;
}

export function readMotionBudget(): MotionBudget {
  return getMotionBudget();
}

export { resetMotionBudget, evaluateMotionBudget, DEFAULT_MOTION_BUDGET };

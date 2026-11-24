import { useEffect, useState } from 'react';
import {
  DEFAULT_MOTION_BUDGET,
  evaluateMotionBudget,
  getMotionBudget,
  type MotionBudget,
  resetMotionBudget,
} from './budget';

/**
 * Client motion budget. Defaults to fallback until evaluateMotionBudget runs (AC-19 / AC-8).
 */
export function useMotionBudget(): MotionBudget {
  const [budget, setBudget] = useState<MotionBudget>(DEFAULT_MOTION_BUDGET);

  useEffect(() => {
    setBudget(evaluateMotionBudget());
  }, []);

  return budget;
}

export function readMotionBudget(): MotionBudget {
  return getMotionBudget();
}

export { resetMotionBudget, evaluateMotionBudget, DEFAULT_MOTION_BUDGET };

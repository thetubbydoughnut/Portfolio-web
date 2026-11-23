export type MotionBudget = 'effects-on' | 'fallback';

/** Callers/hooks default to fallback until the client check runs (SSR + initial paint). */
export const DEFAULT_MOTION_BUDGET: MotionBudget = 'fallback';

export type MotionBudgetState = {
  budget: MotionBudget;
  evaluated: boolean;
};

export function createMotionBudgetState(): MotionBudgetState {
  return {
    budget: DEFAULT_MOTION_BUDGET,
    evaluated: false,
  };
}

let sharedState: MotionBudgetState = createMotionBudgetState();

export function getMotionBudget(): MotionBudget {
  return sharedState.budget;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function canCreateWebGLContext(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

function isSaveDataEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean };
    }
  ).connection;
  return connection?.saveData === true;
}

/**
 * Returns 'effects-on' only when ALL are true:
 * 1. prefers-reduced-motion is NOT reduce
 * 2. a WebGL context (webgl2 or webgl) can be created
 * 3. navigator.connection?.saveData is NOT true
 * Otherwise 'fallback'.
 */
export function evaluateMotionBudget(
  state: MotionBudgetState = sharedState
): MotionBudget {
  const ok =
    !prefersReducedMotion() &&
    canCreateWebGLContext() &&
    !isSaveDataEnabled();

  const budget: MotionBudget = ok ? 'effects-on' : 'fallback';
  state.budget = budget;
  state.evaluated = true;
  if (state === sharedState) {
    sharedState = state;
  }
  return budget;
}

/** Reset shared state (tests / HMR). */
export function resetMotionBudget(): void {
  sharedState = createMotionBudgetState();
}

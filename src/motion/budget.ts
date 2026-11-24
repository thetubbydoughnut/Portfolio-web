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

/** Viewport ≥ 1024 via matchMedia when available, else innerWidth. */
function isWideViewport(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(min-width: 1024px)').matches;
  }
  return window.innerWidth >= 1024;
}

function hasFinePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(pointer: fine)').matches;
}

/**
 * When present, hardwareConcurrency must be ≥ 6; when absent, do not block.
 */
function hasEnoughCores(): boolean {
  if (typeof navigator === 'undefined') return true;
  const cores = (navigator as Navigator).hardwareConcurrency;
  if (cores === undefined || cores === null || Number.isNaN(cores)) return true;
  return cores >= 6;
}

/**
 * When present, deviceMemory must be ≥ 4; when absent, do not block.
 */
function hasEnoughMemory(): boolean {
  if (typeof navigator === 'undefined') return true;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory === undefined || memory === null || Number.isNaN(memory)) return true;
  return memory >= 4;
}

/**
 * Returns 'effects-on' only when ALL are true (A3.5.1):
 * 1. prefers-reduced-motion is NOT reduce
 * 2. a WebGL context can be created
 * 3. navigator.connection?.saveData is NOT true
 * 4. viewport ≥ 1024 px
 * 5. pointer: fine
 * 6. hardwareConcurrency ≥ 6 when present
 * 7. deviceMemory ≥ 4 when present
 * Otherwise 'fallback'.
 */
export function evaluateMotionBudget(
  state: MotionBudgetState = sharedState
): MotionBudget {
  const ok =
    !prefersReducedMotion() &&
    canCreateWebGLContext() &&
    !isSaveDataEnabled() &&
    isWideViewport() &&
    hasFinePointer() &&
    hasEnoughCores() &&
    hasEnoughMemory();

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

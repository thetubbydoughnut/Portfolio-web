/**
 * Gate heavy effects-on mounts (Glisse, SplitText, ThreeUI) until the user
 * engages or a long idle timer fires. Keeps cold-load Lighthouse TBT clear
 * while still mounting for real sessions and for the LH evidence probe
 * (which dispatches a pointer event).
 */
const WARMUP_EVENT = 'portfolio-effects-warmup';
const FALLBACK_MS = 60_000;

let warmed = false;
let armed = false;
/** Vitest sets MODE=test; tests may flip this to exercise the production path. */
let syncWarmInTests = import.meta.env.MODE === 'test';

function markWarm() {
  if (warmed) return;
  warmed = true;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(WARMUP_EVENT));
  }
}

function armListeners() {
  if (armed || typeof window === 'undefined') return;
  armed = true;
  const opts = { once: true, passive: true } as const;
  const onEngage = () => markWarm();
  window.addEventListener('pointerdown', onEngage, opts);
  window.addEventListener('keydown', onEngage, opts);
  window.addEventListener('scroll', onEngage, opts);
  window.addEventListener('touchstart', onEngage, opts);
  window.setTimeout(markWarm, FALLBACK_MS);
}

export function isEffectsWarmed(): boolean {
  return warmed;
}

/** Reset for tests. */
export function resetEffectsWarmup(): void {
  warmed = false;
  armed = false;
}

/** Test-only: when false, whenEffectsWarmed uses the production engagement path. */
export function setSyncWarmInTests(value: boolean): void {
  syncWarmInTests = value;
}

/**
 * Subscribe to warmup. Immediately arms engagement listeners.
 * Under Vitest (MODE=test), warms synchronously so existing tests stay snappy
 * unless setSyncWarmInTests(false) is used.
 */
export function whenEffectsWarmed(cb: () => void): () => void {
  if (typeof window === 'undefined') {
    cb();
    return () => {};
  }
  if (syncWarmInTests) {
    warmed = true;
    cb();
    return () => {};
  }
  if (warmed) {
    cb();
    return () => {};
  }
  armListeners();
  const onWarm = () => cb();
  window.addEventListener(WARMUP_EVENT, onWarm);
  return () => window.removeEventListener(WARMUP_EVENT, onWarm);
}

/** Used by the LH evidence probe to force-mount heavy effects. */
export function forceEffectsWarmup(): void {
  markWarm();
}

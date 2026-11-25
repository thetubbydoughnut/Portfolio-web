import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  forceEffectsWarmup,
  isEffectsWarmed,
  resetEffectsWarmup,
  setSyncWarmInTests,
  whenEffectsWarmed,
} from './effectsWarmup';

describe('effectsWarmup (cold-load TBT gate)', () => {
  beforeEach(() => {
    resetEffectsWarmup();
    setSyncWarmInTests(true);
  });

  afterEach(() => {
    resetEffectsWarmup();
    setSyncWarmInTests(true);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('under Vitest sync path, whenEffectsWarmed fires synchronously', () => {
    const spy = vi.fn();
    const stop = whenEffectsWarmed(spy);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(isEffectsWarmed()).toBe(true);
    stop();
  });

  it('forceEffectsWarmup marks warmed for subsequent subscribers', () => {
    forceEffectsWarmup();
    expect(isEffectsWarmed()).toBe(true);
    const spy = vi.fn();
    whenEffectsWarmed(spy);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('resetEffectsWarmup clears warmed state', () => {
    forceEffectsWarmup();
    expect(isEffectsWarmed()).toBe(true);
    resetEffectsWarmup();
    expect(isEffectsWarmed()).toBe(false);
  });

  it('production path: pointerdown warms and notifies subscribers', () => {
    setSyncWarmInTests(false);
    resetEffectsWarmup();
    const spy = vi.fn();
    whenEffectsWarmed(spy);
    expect(spy).not.toHaveBeenCalled();
    expect(isEffectsWarmed()).toBe(false);
    window.dispatchEvent(new Event('pointerdown'));
    expect(isEffectsWarmed()).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('production path: fallback timer warms after FALLBACK_MS', () => {
    setSyncWarmInTests(false);
    resetEffectsWarmup();
    vi.useFakeTimers();
    const spy = vi.fn();
    whenEffectsWarmed(spy);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60_000);
    expect(isEffectsWarmed()).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('production path: already-warmed invokes callback immediately', () => {
    setSyncWarmInTests(false);
    forceEffectsWarmup();
    const spy = vi.fn();
    whenEffectsWarmed(spy);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement } from 'react';
import { render, screen, act } from '@testing-library/react';
import { useMotionBudget } from './useMotionBudget';
import { resetMotionBudget } from './budget';

type TierOpts = {
  reduce?: boolean;
  webgl?: boolean;
  saveData?: boolean;
  width?: number;
  pointerFine?: boolean;
  cores?: number | undefined;
  memory?: number | undefined;
};

async function loadBudget() {
  return import('./budget');
}

function stubEnv(opts: TierOpts) {
  const {
    reduce = false,
    webgl = true,
    saveData = false,
    width = 1280,
    pointerFine = true,
    cores = 8,
    memory = 8,
  } = opts;

  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches:
        (query.includes('prefers-reduced-motion: reduce') && reduce) ||
        (query.includes('pointer: fine') && pointerFine) ||
        (query.includes('min-width: 1024') && width >= 1024),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  HTMLCanvasElement.prototype.getContext = vi.fn(() =>
    webgl ? ({ getExtension: vi.fn() } as unknown as RenderingContext) : null
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  Object.defineProperty(navigator, 'connection', {
    configurable: true,
    value: { saveData },
  });
  if (cores === undefined) {
    // omit
    try {
      // @ts-expect-error allow delete
      delete (navigator as { hardwareConcurrency?: number }).hardwareConcurrency;
    } catch {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        configurable: true,
        value: undefined,
      });
    }
  } else {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      configurable: true,
      value: cores,
    });
  }
  if (memory === undefined) {
    Object.defineProperty(navigator, 'deviceMemory', {
      configurable: true,
      value: undefined,
    });
  } else {
    Object.defineProperty(navigator, 'deviceMemory', {
      configurable: true,
      value: memory,
    });
  }
}

describe('AC-31: motion budget device tiers (A3.5.1)', () => {
  beforeEach(() => {
    vi.resetModules();
    resetMotionBudget();
  });

  afterEach(() => {
    resetMotionBudget();
    vi.restoreAllMocks();
  });

  it('effects-on only when desktop-class gates all pass', async () => {
    stubEnv({});
    const { evaluateMotionBudget } = await loadBudget();
    expect(evaluateMotionBudget()).toBe('effects-on');
  });

  it.each([
    ['reduced motion', { reduce: true }],
    ['no WebGL', { webgl: false }],
    ['saveData', { saveData: true }],
    ['narrow viewport', { width: 375 }],
    ['coarse pointer', { pointerFine: false }],
    ['low cores', { cores: 4 }],
    ['low memory', { memory: 2 }],
  ] as const)('fallback when %s', async (_label, opts) => {
    stubEnv(opts);
    const { evaluateMotionBudget } = await loadBudget();
    expect(evaluateMotionBudget()).toBe('fallback');
  });

  it('omitted hardwareConcurrency / deviceMemory do not block effects-on', async () => {
    stubEnv({ cores: undefined, memory: undefined });
    const { evaluateMotionBudget } = await loadBudget();
    expect(evaluateMotionBudget()).toBe('effects-on');
  });

  it('useMotionBudget resubscribes when prefers-reduced-motion changes', async () => {
    let reduced = false;
    const listeners = new Set<(ev: MediaQueryListEvent) => void>();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1280,
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches:
          (query.includes('prefers-reduced-motion: reduce') && reduced) ||
          (query.includes('pointer: fine') && true) ||
          (query.includes('min-width: 1024') && true),
        media: query,
        addEventListener: (_t: string, cb: (ev: MediaQueryListEvent) => void) => {
          if (query.includes('prefers-reduced-motion')) listeners.add(cb);
        },
        removeEventListener: (_t: string, cb: (ev: MediaQueryListEvent) => void) => {
          listeners.delete(cb);
        },
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => ({ getExtension: vi.fn() }) as unknown as RenderingContext
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false },
    });
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      configurable: true,
      value: 8,
    });
    Object.defineProperty(navigator, 'deviceMemory', {
      configurable: true,
      value: 8,
    });

    function Probe() {
      const budget = useMotionBudget();
      return createElement('div', { 'data-testid': 'budget' }, budget);
    }

    render(createElement(Probe));
    expect(screen.getByTestId('budget').textContent).toBe('effects-on');
    reduced = true;
    act(() => {
      listeners.forEach((cb) => cb({ matches: true } as MediaQueryListEvent));
    });
    expect(screen.getByTestId('budget').textContent).toBe('fallback');
  });
});

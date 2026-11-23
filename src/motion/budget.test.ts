import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

type Budget = 'effects-on' | 'fallback';

describe('AC-19: shared motion/GPU budget helper', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function loadBudget() {
    return import('./budget');
  }

  function stubMatchMedia(reduce: boolean) {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: reduce && query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );
  }

  function stubWebGL(ok: boolean) {
    const canvasProto = HTMLCanvasElement.prototype;
    vi.spyOn(canvasProto, 'getContext').mockImplementation((type: string) => {
      if (!ok) return null;
      if (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl') {
        return {} as unknown as RenderingContext;
      }
      return null;
    });
  }

  function stubConnection(saveData: boolean | undefined) {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value:
        saveData === undefined
          ? undefined
          : { saveData },
    });
  }

  it("defaults to 'fallback' before client evaluation (SSR / initial)", async () => {
    const { DEFAULT_MOTION_BUDGET, getMotionBudget, evaluateMotionBudget } =
      await loadBudget();
    expect(DEFAULT_MOTION_BUDGET).toBe('fallback');
    // Pure getter without running evaluate should stay fallback
    expect(getMotionBudget()).toBe('fallback');
    expect(typeof evaluateMotionBudget).toBe('function');
  });

  it("returns 'effects-on' only when motion ok, WebGL ok, and saveData is not true", async () => {
    stubMatchMedia(false);
    stubWebGL(true);
    stubConnection(false);
    const { evaluateMotionBudget } = await loadBudget();
    expect(evaluateMotionBudget()).toBe('effects-on' satisfies Budget);
  });

  it("returns 'fallback' when prefers-reduced-motion: reduce", async () => {
    stubMatchMedia(true);
    stubWebGL(true);
    stubConnection(false);
    const { evaluateMotionBudget } = await loadBudget();
    expect(evaluateMotionBudget()).toBe('fallback');
  });

  it("returns 'fallback' when navigator.connection.saveData is true", async () => {
    stubMatchMedia(false);
    stubWebGL(true);
    stubConnection(true);
    const { evaluateMotionBudget } = await loadBudget();
    expect(evaluateMotionBudget()).toBe('fallback');
  });

  it("returns 'fallback' when WebGL is unavailable", async () => {
    stubMatchMedia(false);
    stubWebGL(false);
    stubConnection(false);
    const { evaluateMotionBudget } = await loadBudget();
    expect(evaluateMotionBudget()).toBe('fallback');
  });

  it('negative: must not default to effects-on before client evaluation', async () => {
    const { DEFAULT_MOTION_BUDGET, createMotionBudgetState } = await loadBudget();
    expect(DEFAULT_MOTION_BUDGET).not.toBe('effects-on');
    const state = createMotionBudgetState();
    expect(state.budget).toBe('fallback');
    expect(state.evaluated).toBe(false);
  });

  it('evaluate updates shared state; callers see effects-on only after evaluate', async () => {
    stubMatchMedia(false);
    stubWebGL(true);
    stubConnection(undefined); // no connection API → saveData not true
    const { createMotionBudgetState, evaluateMotionBudget } = await loadBudget();
    const state = createMotionBudgetState();
    expect(state.budget).toBe('fallback');
    const result = evaluateMotionBudget(state);
    expect(result).toBe('effects-on');
    expect(state.budget).toBe('effects-on');
    expect(state.evaluated).toBe(true);
  });
});

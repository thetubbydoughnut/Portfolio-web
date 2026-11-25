import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement, Suspense, useState } from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ensureSharedDist,
  collectDistJs,
  SHARED_DIST,
} from '../test/ensure-dist-build.js';
import { evaluateMotionBudget, resetMotionBudget } from './budget';
import { RouteTransition } from './RouteTransition';

function stubBudget(effectsOn: boolean) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: effectsOn ? 1280 : 375 });
  Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: effectsOn ? 8 : 2 });
  Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: effectsOn ? 8 : 2 });
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches:
        (query.includes('prefers-reduced-motion: reduce') && !effectsOn) ||
        (query.includes('pointer: fine') && effectsOn) ||
        (query.includes('min-width: 1024') && effectsOn),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  HTMLCanvasElement.prototype.getContext = vi.fn(() => {
    if (!effectsOn) return null;
    return {
      getExtension: vi.fn(),
      createShader: vi.fn(() => ({})),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn(() => true),
      createProgram: vi.fn(() => ({})),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      getProgramParameter: vi.fn(() => true),
      useProgram: vi.fn(),
      createBuffer: vi.fn(() => ({})),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      getAttribLocation: vi.fn(() => 0),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      getUniformLocation: vi.fn(() => ({})),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      createTexture: vi.fn(() => ({})),
      bindTexture: vi.fn(),
      texParameteri: vi.fn(),
      texImage2D: vi.fn(),
      activeTexture: vi.fn(),
      uniform1i: vi.fn(),
      viewport: vi.fn(),
      clearColor: vi.fn(),
      clear: vi.fn(),
      drawArrays: vi.fn(),
      deleteTexture: vi.fn(),
      deleteBuffer: vi.fn(),
      deleteProgram: vi.fn(),
      deleteShader: vi.fn(),
      canvas: { width: 16, height: 16 },
      drawingBufferWidth: 16,
      drawingBufferHeight: 16,
    } as unknown as WebGLRenderingContext;
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  Object.defineProperty(navigator, 'connection', {
    configurable: true,
    value: { saveData: !effectsOn },
  });
}

function Probe() {
  const loc = useLocation();
  return createElement('div', { 'data-testid': 'path' }, loc.pathname);
}

function Harness({ effectsOn }: { effectsOn: boolean }) {
  return createElement(
    MemoryRouter,
    { initialEntries: ['/'] },
    createElement(
      RouteTransition,
      null,
      createElement(
        'div',
        null,
        createElement(Link, { to: '/projects' }, 'Go projects'),
        createElement(Link, { to: '/skills' }, 'Go skills'),
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/', element: createElement('div', null, 'Home page') }),
          createElement(Route, {
            path: '/projects',
            element: createElement('div', null, 'Projects page'),
          }),
          createElement(Route, { path: '/skills', element: createElement('div', null, 'Skills page') })
        ),
        createElement(Probe)
      )
    )
  );
}

describe('AC-24: directional GL route transition', () => {
  beforeEach(() => {
    resetMotionBudget();
  });

  afterEach(() => {
    resetMotionBudget();
  });

  it('vendors only the directional shader (MIT) and depends on gl-transition', () => {
    const shaderPath = join(process.cwd(), 'src/motion/shaders/directional.glsl');
    expect(existsSync(shaderPath)).toBe(true);
    const glsl = readFileSync(shaderPath, 'utf8');
    expect(glsl).toMatch(/License:\s*MIT/i);
    expect(glsl).toMatch(/directional|direction/);

    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    expect(pkg.dependencies['gl-transition']).toBeTruthy();
    expect(pkg.dependencies['gl-transitions']).toBeUndefined();
    expect(pkg.dependencies['gl-react']).toBeUndefined();
    expect(pkg.dependencies['react-gl-transition']).toBeUndefined();
  });

  it('completes navigation under fallback with opacity/instant (no GPU overlay)', async () => {
    stubBudget(false);
    evaluateMotionBudget();
    render(createElement(Harness, { effectsOn: false }));
    expect(screen.getByTestId('path').textContent).toBe('/');
    fireEvent.click(screen.getByRole('link', { name: /Go projects/i }));
    await waitFor(() => {
      expect(screen.getByTestId('path').textContent).toBe('/projects');
    });
    expect(document.querySelector('[data-route-transition="gpu"]')).toBeNull();
    expect(
      document.querySelector('[data-route-transition="fade"], [data-route-transition="instant"]')
    ).toBeTruthy();
  });

  it('negative: GPU transition is not used under reduced motion', () => {
    stubBudget(false);
    expect(evaluateMotionBudget()).toBe('fallback');
    const src = readFileSync(join(process.cwd(), 'src/motion/RouteTransition.tsx'), 'utf8');
    expect(src).toMatch(/fallback|effects-on/);
  });

  it('effects-on path exposes a disposable overlay contract (duration ≤ 600ms)', async () => {
    stubBudget(true);
    evaluateMotionBudget();
    render(createElement(Harness, { effectsOn: true }));
    fireEvent.click(screen.getByRole('link', { name: /Go skills/i }));
    await waitFor(() => {
      expect(screen.getByTestId('path').textContent).toBe('/skills');
    });
    const src = readFileSync(join(process.cwd(), 'src/motion/RouteTransition.tsx'), 'utf8');
    expect(src).toMatch(/600|duration-route|--duration-route/);
    expect(src).toMatch(/dispose|cleanup|deleteProgram|remove\(/);
  });

  it('built client graph does not include unused gl-transitions shaders', async () => {
    await ensureSharedDist();
    const blob = collectDistJs(SHARED_DIST);
    expect(blob.length).toBeGreaterThan(0);
    // Other collection shaders must not appear
    expect(blob).not.toMatch(/kaleidoscope/i);
    expect(blob).not.toMatch(/pinwheel/i);
    expect(blob).not.toMatch(/morphx/i);
    expect(blob).not.toMatch(/DreamyZoom/i);
    // Must not import the npm collection barrel
    expect(blob).not.toMatch(/node_modules\/gl-transitions/);
    // directional source may appear once if inlined
    const directionalHits = blob.match(/uniform vec2 direction/g) || [];
    expect(directionalHits.length).toBeLessThanOrEqual(2);
  }, 120000);
});

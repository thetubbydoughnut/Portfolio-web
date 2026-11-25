/**
 * AC-24: one directional GL Transition on in-app route changes.
 * Uses gl-transition + vendored directional.glsl only. Falls back to
 * opacity/instant when budget is fallback, capture fails, or WebGL throws.
 * Overlay WebGL context is disposed after each transition (≤ 600ms).
 *
 * gl-transition is dynamic-imported so it stays off the initial-route graph.
 */
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useMotionBudget } from './useMotionBudget';

const MAX_MS = 600;

type GLTextureLike = {
  bind: (unit: number) => number;
  shape: [number, number];
};

type TransitionApi = {
  draw: (
    progress: number,
    from: GLTextureLike,
    to: GLTextureLike,
    width?: number,
    height?: number,
    params?: Record<string, unknown>
  ) => void;
  dispose: () => void;
};

function makeColorTexture(
  gl: WebGLRenderingContext,
  rgba: [number, number, number, number],
  size = 64
): GLTextureLike & { dispose: () => void } {
  const tex = gl.createTexture();
  if (!tex) throw new Error('texture');
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const o = i * 4;
    data[o] = rgba[0];
    data[o + 1] = rgba[1];
    data[o + 2] = rgba[2];
    data[o + 3] = rgba[3];
  }
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  return {
    shape: [size, size],
    bind(unit: number) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      return unit;
    },
    dispose() {
      gl.deleteTexture(tex);
    },
  };
}

function readThemeRgb(): [number, number, number, number] {
  if (typeof getComputedStyle === 'undefined' || typeof document === 'undefined') {
    return [11, 12, 15, 255];
  }
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
  const hex = bg.startsWith('#') ? bg.slice(1) : '0B0C0F';
  const n = parseInt(hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex, 16);
  if (Number.isNaN(n)) return [11, 12, 15, 255];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

export type RouteTransitionProps = {
  children: ReactNode;
};

export function RouteTransition({ children }: RouteTransitionProps) {
  const location = useLocation();
  const budget = useMotionBudget();
  const effectsOn = budget === 'effects-on';
  const prevPath = useRef(location.pathname);
  const [mode, setMode] = useState<'gpu' | 'fade' | 'instant'>(
    effectsOn ? 'fade' : 'instant'
  );
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const running = useRef(false);

  useEffect(() => {
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    if (!effectsOn) {
      setMode('instant');
      return;
    }

    if (running.current) return;
    running.current = true;

    let disposed = false;
    let raf = 0;
    let transitionApi: TransitionApi | null = null;
    let fromTex: (GLTextureLike & { dispose: () => void }) | null = null;
    let toTex: (GLTextureLike & { dispose: () => void }) | null = null;
    let buffer: WebGLBuffer | null = null;
    const canvas = overlayRef.current;

    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      try {
        transitionApi?.dispose();
      } catch {
        /* ignore */
      }
      try {
        fromTex?.dispose();
        toTex?.dispose();
      } catch {
        /* ignore */
      }
      if (canvas) {
        const gl =
          canvas.getContext('webgl') ||
          (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
        if (gl && buffer) {
          try {
            gl.deleteBuffer(buffer);
          } catch {
            /* ignore */
          }
        }
        canvas.width = 0;
        canvas.height = 0;
        canvas.style.opacity = '0';
        canvas.style.pointerEvents = 'none';
      }
      transitionApi = null;
      running.current = false;
    };

    (async () => {
      try {
        if (!canvas) throw new Error('no canvas');
        const [{ default: createTransition }, glslMod] = await Promise.all([
          import('gl-transition'),
          import('./shaders/directional.glsl?raw'),
        ]);
        const directionalGlsl = String(glslMod.default || glslMod)
          .replace(/^\/\/.*$/gm, '')
          .trim();
        const DIRECTIONAL = {
          glsl: directionalGlsl,
          defaultParams: { direction: [0, 1] },
          paramsTypes: { direction: 'vec2' },
        };

        if (disposed) return;

        const width = Math.max(2, window.innerWidth);
        const height = Math.max(2, window.innerHeight);
        canvas.width = width;
        canvas.height = height;
        canvas.style.opacity = '1';
        canvas.style.pointerEvents = 'none';

        const gl =
          (canvas.getContext('webgl', {
            premultipliedAlpha: false,
          }) as WebGLRenderingContext | null) ||
          (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
        if (!gl) throw new Error('no webgl');

        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, -1, 4, 4, -1]),
          gl.STATIC_DRAW
        );
        gl.viewport(0, 0, width, height);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        const rgb = readThemeRgb();
        const rgb2: [number, number, number, number] = [
          Math.min(255, rgb[0] + 18),
          Math.min(255, rgb[1] + 18),
          Math.min(255, rgb[2] + 22),
          255,
        ];
        fromTex = makeColorTexture(gl, rgb);
        toTex = makeColorTexture(gl, rgb2);
        transitionApi = createTransition(gl, DIRECTIONAL, { resizeMode: 'cover' });
        setMode('gpu');

        const start = performance.now();
        const tick = (now: number) => {
          if (disposed) return;
          const t = Math.min(1, (now - start) / MAX_MS);
          try {
            transitionApi?.draw(t, fromTex!, toTex!, width, height, {
              direction: [0, -1],
            });
          } catch {
            cleanup();
            setMode('fade');
            return;
          }
          if (t < 1) {
            raf = requestAnimationFrame(tick);
          } else {
            cleanup();
          }
        };
        raf = requestAnimationFrame(tick);
        window.setTimeout(cleanup, MAX_MS + 50);
      } catch {
        cleanup();
        setMode('fade');
        window.setTimeout(() => {
          running.current = false;
        }, 160);
      }
    })();

    return cleanup;
  }, [location.pathname, effectsOn]);

  useEffect(() => {
    if (!effectsOn) setMode('instant');
  }, [effectsOn]);

  const shellStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: '100%',
  };

  const canvasStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100dvh',
    zIndex: 40,
    opacity: 0,
    pointerEvents: 'none',
  };

  return (
    <div
      style={shellStyle}
      data-route-transition={mode}
      data-motion-budget={budget}
      data-route-duration-ms={MAX_MS}
    >
      {children}
      <canvas
        ref={overlayRef}
        aria-hidden="true"
        data-route-transition-canvas
        style={canvasStyle}
      />
    </div>
  );
}

export default RouteTransition;

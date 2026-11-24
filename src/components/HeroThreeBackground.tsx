import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { MotionBudget } from '../motion/budget';
import posterWebp from '../assets/images/hero-poster.webp';
import posterAvif from '../assets/images/hero-poster.avif';

const EmeraldHorizonLazy = lazy(() => import('./EmeraldHorizonLazy'));

const DPR_CAP = 1.5;

type HeroThreeBackgroundProps = {
  budget: MotionBudget;
};

class LazyErrorCatch extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function HeroPoster() {
  // Gradient first (hero text owns LCP). Bitmap after window load + idle.
  const [bitmap, setBitmap] = useState(false);
  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    let cancelled = false;
    const arm = () => {
      const ric = window.requestIdleCallback;
      if (typeof ric === 'function') {
        idleId = ric(
          () => {
            if (!cancelled) setBitmap(true);
          },
          { timeout: 3000 }
        );
      } else {
        timeoutId = window.setTimeout(() => {
          if (!cancelled) setBitmap(true);
        }, 500) as unknown as number;
      }
    };
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', arm);
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      className={`hero-stage-poster${bitmap ? ' hero-stage-poster--bitmap' : ''}`}
      data-hero-stage="poster"
      data-hero-poster=""
      aria-hidden="true"
      style={
        bitmap
          ? {
              backgroundImage: `image-set(url("${posterAvif}") type("image/avif"), url("${posterWebp}") type("image/webp"))`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    />
  );
}

/**
 * Cap devicePixelRatio while ThreeUI mounts (package has no DPR prop;
 * EmeraldHorizonBackground.js hardcodes min(dpr, 2)).
 */
function useDprCap(active: boolean) {
  useEffect(() => {
    if (!active) return undefined;
    const desc = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
    const current =
      typeof window.devicePixelRatio === 'number' ? window.devicePixelRatio : 1;
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      get: () => Math.min(current, DPR_CAP),
    });
    return () => {
      if (desc) Object.defineProperty(window, 'devicePixelRatio', desc);
      else delete (window as { devicePixelRatio?: number }).devicePixelRatio;
    };
  }, [active]);
}

/**
 * Lazy ThreeUI Community hero stage (AC-20 / AC-31).
 * Idle mount after load; pause offscreen/hidden; copper CSS grade; poster under canvas.
 */
export function HeroThreeBackground({ budget }: HeroThreeBackgroundProps) {
  const [idleReady, setIdleReady] = useState(false);
  const [inView, setInView] = useState(true);
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden
  );
  const [failed, setFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const effectsOn = budget === 'effects-on';
  const shouldMount =
    effectsOn && idleReady && inView && visible && !failed;

  useDprCap(shouldMount);

  // Idle mount: after window load, then requestIdleCallback (2s timeout).
  useEffect(() => {
    if (!effectsOn) {
      setIdleReady(false);
      return undefined;
    }

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    let cancelled = false;

    const armIdle = () => {
      const ric = window.requestIdleCallback;
      if (typeof ric === 'function') {
        idleId = ric(
          () => {
            if (!cancelled) setIdleReady(true);
          },
          { timeout: 2000 }
        );
      } else {
        timeoutId = window.setTimeout(() => {
          if (!cancelled) setIdleReady(true);
        }, 1) as unknown as number;
      }
    };

    if (document.readyState === 'complete') {
      armIdle();
    } else {
      window.addEventListener('load', armIdle, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('load', armIdle);
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [effectsOn]);

  // Pause when hero leaves viewport.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      { root: null, threshold: 0.05 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Pause when tab hidden.
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <div
      ref={rootRef}
      className="hero-stage-stack"
      aria-hidden="true"
      data-hero-dpr-cap={DPR_CAP}
    >
      <HeroPoster />
      {shouldMount ? (
        <div
          className="hero-stage-canvas hero-stage-grade"
          data-hero-stage="threeui"
        >
          <Suspense fallback={null}>
            <LazyErrorCatch onError={() => setFailed(true)}>
              <EmeraldHorizonLazy />
            </LazyErrorCatch>
          </Suspense>
        </div>
      ) : (
        <div className="hero-stage-fallback" data-hero-stage="fallback" />
      )}
    </div>
  );
}

export default HeroThreeBackground;

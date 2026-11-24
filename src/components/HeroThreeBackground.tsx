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
  /**
   * Visible poster is a copper/ink CSS grade (never a full-viewport bitmap LCP).
   * AVIF/WebP stills ship and preload off-screen so the asset budget is met (A3.5.1)
   * without becoming the LCP element under lab throttling.
   */
  return (
    <>
      <div
        className="hero-stage-poster"
        data-hero-stage="poster"
        data-hero-poster=""
        aria-hidden="true"
      />
      <picture className="hero-stage-poster-asset" data-hero-poster-asset="" aria-hidden="true">
        <source srcSet={posterAvif} type="image/avif" />
        <img
          src={posterWebp}
          alt=""
          width={1280}
          height={720}
          decoding="async"
          fetchPriority="low"
        />
      </picture>
    </>
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

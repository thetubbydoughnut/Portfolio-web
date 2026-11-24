import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { MotionBudget } from '../motion/budget';
import '@designcodeio/threeui/style.css';

const EmeraldHorizonBackground = lazy(() =>
  import('@designcodeio/threeui/components/EmeraldHorizonBackground').then((m) => ({
    default: m.EmeraldHorizonBackground,
  }))
);

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
      return (
        <div className="hero-stage-fallback" aria-hidden="true" data-hero-stage="error" />
      );
    }
    return this.props.children;
  }
}

/**
 * Lazy ThreeUI Community hero stage (AC-20). Subpath import only; never the package root.
 * Chosen export: EmeraldHorizonBackground.
 */
export function HeroThreeBackground({ budget }: HeroThreeBackgroundProps) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (budget !== 'effects-on') {
      setReady(false);
      return;
    }
    // Defer past first paint so the ThreeUI chunk is not in the initial graph.
    const id = window.requestAnimationFrame(() => {
      setReady(true);
    });
    return () => window.cancelAnimationFrame(id);
  }, [budget]);

  if (budget !== 'effects-on' || failed || !ready) {
    return (
      <div
        className="hero-stage-fallback"
        aria-hidden="true"
        data-hero-stage="fallback"
      />
    );
  }

  return (
    <div className="hero-stage-canvas" aria-hidden="true" data-hero-stage="threeui">
      <Suspense
        fallback={
          <div className="hero-stage-fallback" aria-hidden="true" data-hero-stage="loading" />
        }
      >
        <LazyErrorCatch onError={() => setFailed(true)}>
          <EmeraldHorizonBackground />
        </LazyErrorCatch>
      </Suspense>
    </div>
  );
}

export default HeroThreeBackground;

/**
 * Lazy chunk entry for ThreeUI EmeraldHorizon (AC-20 / A3.5.6).
 * style.css rides this chunk only — never the critical path.
 */
import '@designcodeio/threeui/style.css';
import { EmeraldHorizonBackground } from '@designcodeio/threeui/components/EmeraldHorizonBackground';

/** Copper retint: hue-rotate shifts hardcoded green shader toward copper. */
export const COPPER_HUE_DEG = -85;

type Props = {
  className?: string;
};

export default function EmeraldHorizonLazy({ className }: Props) {
  return (
    <EmeraldHorizonBackground
      className={className}
      hue={COPPER_HUE_DEG}
      glow={0.85}
      vignette={1.1}
    />
  );
}

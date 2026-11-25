/**
 * AC-15: SpotlightCard when effects-on; static glass surface under fallback
 * so the spotlight never tracks the pointer on the reduced-motion path.
 */
import type { ReactNode, CSSProperties } from 'react';
import SpotlightCard from './react-bits/SpotlightCard';
import { useMotionBudget } from '../motion/useMotionBudget';

export type ProjectSpotlightCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function ProjectSpotlightCard({
  children,
  className = '',
  style,
}: ProjectSpotlightCardProps) {
  const budget = useMotionBudget();
  const effectsOn = budget === 'effects-on';

  if (!effectsOn) {
    return (
      <div
        className={`project-card project-card--static ${className}`.trim()}
        style={style}
        data-spotlight-card
        data-spotlight-track="off"
        data-motion-budget={budget}
      >
        {children}
      </div>
    );
  }

  return (
    <SpotlightCard
      className={`project-card ${className}`.trim()}
      style={style}
      data-spotlight-card
      data-spotlight-track="on"
      data-motion-budget={budget}
      spotlightColor="rgba(212, 168, 102, 0.55)"
      intensity={0.18}
      theme="dark"
    >
      {children}
    </SpotlightCard>
  );
}

export default ProjectSpotlightCard;

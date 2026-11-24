import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { useMotionBudget } from '../motion/useMotionBudget';

const PageTransitionMotion = lazy(() => import('./PageTransitionMotion'));

const PageTransition = ({ children }) => {
  const budget = useMotionBudget();
  const effectsOn = budget === 'effects-on';

  // AC-8: under fallback, opacity-only or instant — no translate/scale.
  if (!effectsOn) {
    return (
      <div
        style={{ width: '100%', height: '100%' }}
        data-motion-budget={budget}
        data-page-transition="instant"
      >
        {children}
      </div>
    );
  }

  const variants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };
  const transition = { type: 'tween', ease: 'easeOut', duration: 0.25 };

  return (
    <Suspense
      fallback={
        <div style={{ width: '100%', height: '100%' }} data-page-transition="pending">
          {children}
        </div>
      }
    >
      <PageTransitionMotion budget={budget} variants={variants} transition={transition}>
        {children}
      </PageTransitionMotion>
    </Suspense>
  );
};

PageTransition.propTypes = {
  children: PropTypes.node,
};

export default PageTransition;

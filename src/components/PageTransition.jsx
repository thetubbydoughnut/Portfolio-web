import { lazy, Suspense, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useMotionBudget } from '../motion/useMotionBudget';

const PageTransitionMotion = lazy(() => import('./PageTransitionMotion'));

const PageTransition = ({ children }) => {
  const budget = useMotionBudget();
  const effectsOn = budget === 'effects-on';
  const location = useLocation();
  // Keep framer-motion off the cold-load TBT window; enable after first in-app nav.
  const [firstPath] = useState(() => location.pathname);
  const [allowMotion, setAllowMotion] = useState(false);

  useEffect(() => {
    if (location.pathname !== firstPath) setAllowMotion(true);
  }, [location.pathname, firstPath]);

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

  if (!allowMotion) {
    return (
      <div
        style={{ width: '100%', height: '100%' }}
        data-motion-budget={budget}
        data-page-transition="deferred"
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

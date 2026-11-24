import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useMotionBudget } from '../motion/useMotionBudget';

const PageTransition = ({ children }) => {
  const budget = useMotionBudget();
  const effectsOn = budget === 'effects-on';

  // AC-8: under fallback, opacity-only or instant — no translate/scale.
  const variants = effectsOn
    ? {
        initial: { opacity: 0 },
        in: { opacity: 1 },
        out: { opacity: 0 },
      }
    : {
        initial: { opacity: 1 },
        in: { opacity: 1 },
        out: { opacity: 1 },
      };

  const transition = effectsOn
    ? { type: 'tween', ease: 'easeOut', duration: 0.25 }
    : { duration: 0 };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={transition}
      style={{ width: '100%', height: '100%' }}
      data-motion-budget={budget}
      data-page-transition={effectsOn ? 'opacity' : 'instant'}
    >
      {children}
    </motion.div>
  );
};

PageTransition.propTypes = {
  children: PropTypes.node,
};

export default PageTransition;

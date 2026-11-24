/**
 * A3.5.7: LazyMotion features — kept off the fallback/initial critical path
 * via dynamic import from PageTransition.
 */
import PropTypes from 'prop-types';
import { LazyMotion, domAnimation, m } from 'framer-motion';

const PageTransitionMotion = ({ children, budget, variants, transition }) => (
  <LazyMotion features={domAnimation} strict>
    <m.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={transition}
      style={{ width: '100%', height: '100%' }}
      data-motion-budget={budget}
      data-page-transition="opacity"
    >
      {children}
    </m.div>
  </LazyMotion>
);

PageTransitionMotion.propTypes = {
  children: PropTypes.node,
  budget: PropTypes.string.isRequired,
  variants: PropTypes.object.isRequired,
  transition: PropTypes.object.isRequired,
};

export default PageTransitionMotion;

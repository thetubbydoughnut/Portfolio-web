/**
 * AnimatePresence wrapper — dynamic-imported so framer-motion stays out of
 * the initial-route JS budget on the fallback / mobile poster tier.
 */
import PropTypes from 'prop-types';
import { AnimatePresence } from 'framer-motion';

const MotionPresence = ({ children }) => (
  <AnimatePresence mode="wait">{children}</AnimatePresence>
);

MotionPresence.propTypes = {
  children: PropTypes.node,
};

export default MotionPresence;

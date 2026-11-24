/**
 * A3.5.6: Glisse stays off the initial-route JS graph.
 * Loaded only on the effects-on tier (dynamic import from Header).
 */
import PropTypes from 'prop-types';
import { Glass, Button, TabBar } from 'glisse';

export function GlisseNavBar({ items, value, onValueChange }) {
  return (
    <Glass className="nav-glisse-bar" style={{ borderRadius: 'var(--radius-glass)' }}>
      <TabBar
        aria-label="Primary"
        items={items}
        value={value}
        onValueChange={onValueChange}
      />
    </Glass>
  );
}

GlisseNavBar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

export function GlisseThemeButton({ theme, onToggle }) {
  return (
    <Button
      type="button"
      variant="glass"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={onToggle}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </Button>
  );
}

GlisseThemeButton.propTypes = {
  theme: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
};

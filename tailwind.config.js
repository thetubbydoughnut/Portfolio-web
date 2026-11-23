/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        focus: 'var(--color-focus)',
        danger: 'var(--color-danger)',
        glass: 'var(--glass-bg)',
      },
      borderColor: {
        DEFAULT: 'var(--color-border)',
        glass: 'var(--glass-border)',
      },
      backgroundColor: {
        glass: 'var(--glass-bg)',
      },
      borderRadius: {
        control: 'var(--radius-control)',
        glass: 'var(--radius-glass)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        mid: 'var(--duration-mid)',
        slow: 'var(--duration-slow)',
        route: 'var(--duration-route)',
      },
      backdropBlur: {
        glass: 'var(--glass-blur)',
      },
    },
  },
  plugins: [],
};

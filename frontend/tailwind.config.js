/** @type {import('tailwindcss').Config} */
import lineClamp from '@tailwindcss/line-clamp';

/** Warm palette for public homepage - cozy / hygge style */
const warm = {
  caramel: '#8B5A2B',      // Primary: buttons, emphasis
  beige: '#F5F1E8',        // Main background
  terracotta: '#D4A574',   // Hover, secondary buttons
  cream: '#FDFBF7',        // Content areas, inputs
  camel: '#C4A77D',        // Borders, dividers, icons
  gold: '#B8956A',         // Highlight text, labels
  rust: '#A0522D',         // Notifications, alerts
  warmGray: '#9A8B7A',     // Muted text, disabled
  ink: '#3D3D3D',          // Darkest text (no pure black)
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Use class strategy for dark mode
  theme: {
    extend: {
      colors: {
        warm,
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Source Han Serif"', 'serif'],
      },
      borderRadius: {
        'warm-card': '24px',
        'warm-btn': '12px',
        'warm-input': '8px',
        'warm-pill': '16px',
      },
      boxShadow: {
        'warm-sm': '0 4px 20px rgba(139, 90, 43, 0.08)',
        'warm-md': '0 8px 30px rgba(139, 90, 43, 0.12)',
        'warm-lg': '0 12px 40px rgba(139, 90, 43, 0.16)',
      },
      transitionTimingFunction: {
        warm: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [lineClamp],
};

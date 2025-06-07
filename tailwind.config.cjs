const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['apps/frontend/src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      fontFamily: { sans: ['"General Sans"', ...fontFamily.sans] },
      colors: {
        surface:  '#0B1120',
        surface2: '#171E31',
        onSurface: '#E5E7EB',
        primary:  { DEFAULT: '#3B82F6', glow: '#60A5FA' },
        accent:   '#C084FC',
      },
      boxShadow: {
        glass: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 6px 30px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['index.html', './src/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', 'apps/frontend/src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      fontFamily: { sans: ['"General Sans"', ...fontFamily.sans] },
      colors: {
        surface: '#0B1120',
        surface2: '#171E31',
        onSurface: '#E5E7EB',
        brand: '#3B82F6',
      },
      boxShadow: {
        glass: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 6px 30px rgba(0,0,0,0.35)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
};

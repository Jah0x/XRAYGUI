/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './**/*.tsx'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#3B82F6', dark: '#1E40AF' },
        surface: '#0F172A',
        onSurface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


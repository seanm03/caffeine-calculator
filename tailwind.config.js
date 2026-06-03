/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#faf6f1',
          100: '#f0e6d8',
          200: '#e0ccb3',
          300: '#c9a87c',
          400: '#b8895a',
          500: '#a67142',
          600: '#8b5e3c',
          700: '#6f4a32',
          800: '#5c3d2b',
          900: '#4a3224',
          950: '#2a1a10',
        },
      },
    },
  },
  plugins: [],
}

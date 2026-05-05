/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#00c9b1', dark: '#00a896' },
        gold: '#ffd60a',
        bg: { DEFAULT: '#0f1117', 2: '#161b27', 3: '#1e2537' },
      },
    },
  },
  plugins: [],
}
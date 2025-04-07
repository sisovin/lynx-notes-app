/* .cjs */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        card: 'var(--card-background)',
        text: 'var(--text-color)',
        secondary: 'var(--text-secondary)',
        primary: 'var(--primary-color)',
        hover: 'var(--hover-color)',
        border: 'var(--border-color)'
      }
    },
  },
  plugins: [],
};
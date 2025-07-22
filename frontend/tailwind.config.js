/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1', // Indigo
          dark: '#4f46e5',
        },
        secondary: {
          DEFAULT: '#8b5cf6', // Violet
          dark: '#7c3aed',
        },
        background: {
          DEFAULT: '#0f172a', // Dark blue/slate
          light: '#1e293b',
        },
        accent: {
          DEFAULT: '#ec4899', // Pink
          light: '#f472b6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 10px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)',
      },
    },
  },
  plugins: [],
}
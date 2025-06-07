/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lexend Variable', 'system-ui', 'sans-serif'],
        outfit: ['Outfit Variable', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#ffffff',
          light: 'rgba(255, 255, 255, 0.2)',
          lighter: 'rgba(255, 255, 255, 0.1)',
          dark: '#e6e6e6',
        },
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('light', '.light &')
    }
  ],
} 
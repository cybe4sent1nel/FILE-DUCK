/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fffef7',
          100: '#fffaed',
          200: '#fff4d3',
          300: '#ffeeb8',
          400: '#ffe89e',
          500: '#ffe284',
          600: '#f5d56a',
          700: '#e6c450',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        lemon: {
          50: '#fefef5',
          100: '#fdfce8',
          200: '#fbf7d1',
          300: '#f8f1ba',
          400: '#f5eca3',
          500: '#f2e68c',
          600: '#efd775',
        },
        primary: '#c084fc',
        secondary: '#f2e68c',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f2e68c',
      },
    },
  },
  plugins: [],
};

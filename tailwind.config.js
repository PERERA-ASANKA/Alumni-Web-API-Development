/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#2f9e2f',
          600: '#008000',
          // 700: '#006b00',
          // 800: '#005200',
          // 900: '#003a00',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(48, 62, 140, 0.10)',
      },
    },
  },
  plugins: [],
};

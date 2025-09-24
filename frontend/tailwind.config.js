/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          500: '#800000',
          600: '#660000',
          700: '#4d0000',
        },
      },
    },
  },
  plugins: [],
};

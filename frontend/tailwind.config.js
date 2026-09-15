/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        linho: '#F6F1E7',
        tinta: '#16232B',
        estrada: '#0E6E55',
        'estrada-escura': '#0A4F3E',
        poeira: '#E3B23C',
        terracota: '#B5502C',
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        corpo: ['"Source Sans 3"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

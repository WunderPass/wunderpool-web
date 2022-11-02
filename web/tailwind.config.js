module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Graphik', 'sans-serif'],
        graphik: ['Graphik', 'sans-serif'],
      },
      fontSize: {
        'xs-mobile': '.25rem',
        mobile: '.50rem',
      },
      colors: {
        'wunder-blue': '#0096FE',
        'wunder-light-blue': '#01BFFF',
        'wunder-dark-blue': '#020D30',
        'casama-light': '#6e7df0',
        'casama-blue': '#5F45FD',
        'casama-dark-blue': '#462cf1',
        'casama-light-blue': '#7560ff',
        'casama-extra-light-blue': '#E4DFFF',
        brown: '#d6a34a',
        purple: '#551fbd',
        'powder-blue': '#a0b6f7',
      },
      backgroundImage: {
        'split-blue-white':
          'linear-gradient(to left, #E5E7EB 60% , #01BFFF 40%);',
      },
      width: {
        '40-%': '40%',
      },
      boxShadow: {
        'shadow-max': 'box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'shadow-around': 'box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      dropShadow: {
        '3xl': '0 35px 35px rgba(0, 0, 0, 0.25)',
        around: [
          '0 25px 25px rgba(0, 0, 0, 0.25)',
          '0 25px 25px rgba(0, 0, 0, 0.25)',
        ],
      },
    },
  },
  plugins: [],
};

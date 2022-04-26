module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'wunder-blue': '#0096FE',
        'wunder-light-blue': '#01BFFF',
        'wunder-dark-blue': '#020D30',
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
      },
    },
  },
  plugins: [],
};

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'split-blue-white':
          'linear-gradient(to left, white 60% , #0ea5e9 40%);',
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

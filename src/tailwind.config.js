module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // font is Open Sans
    fontFamily: {
      sans: ['Open Sans', 'sans-serif'],
    },
    extend: {
      colors: {
        bg: {
          // accent: "#5F5DF9",
          accent: '#F7F7FF',
          primary: '#fff',
          secondary: '#fafafa',
          // warning: "#FEF6F5",
          warning: '#FEF6F5',
        },
        text: {
          accent: '#5F5DF9',
          secondary: '#5E5E5E',
          purple: '#B471E1',
          warning: '#F04D42',
        },
        util: {
          separator: '#E3E4E6',
        },
      },
    },
  },
  plugins: [],
}

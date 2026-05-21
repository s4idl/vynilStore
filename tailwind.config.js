export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8',
        dark: '#1A1208',
        warm: '#2C2416',
        gold: '#C9A84C',
        'gold-light': '#E8C97A',
        red: '#C0392B',
        green: '#1A6B3A',
        gray: '#8A8070',
        'card-bg': '#FBF7EE',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

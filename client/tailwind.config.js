export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 45px rgba(112, 97, 255, 0.18)',
      },
      backgroundImage: {
        'grid-gradient': 'radial-gradient(circle at top, rgba(134, 239, 255, 0.18), transparent 38%), radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.18), transparent 20%)',
      },
    },
  },
  plugins: [],
};

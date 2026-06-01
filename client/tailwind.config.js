export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 24px 90px rgba(16, 185, 129, 0.18)',
      },
      backgroundImage: {
        'grid-gradient': 'radial-gradient(circle at top, rgba(16, 185, 129, 0.18), transparent 38%), radial-gradient(circle at 20% 20%, rgba(132, 204, 22, 0.16), transparent 20%)',
      },
    },
  },
  plugins: [],
};

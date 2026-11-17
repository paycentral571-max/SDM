import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: { extend: { colors: { ink: '#0a1020', panel: '#121b2c', panel2: '#192438', line: '#2a3850', muted: '#9aabc5', accent: '#78a6ff', mint: '#4be0b1' }, fontFamily: { sans: ['Inter', 'Arial', 'sans-serif'] } } },
  plugins: [],
} satisfies Config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B0000',  // deep darkred — was #B91C1C
          dark:    '#5C0000',  // near-black red — was #991B1B
          light:   '#B91C1C',  // mid red — was #DC2626
        },
        gold: {
          DEFAULT: '#D4AF37',  // unchanged
          dark:    '#B8941F',  // unchanged
          light:   '#E5C453',  // unchanged
        },
        dark: {
          DEFAULT: '#000000',  // true black — was #0F0F0F
          lighter: '#0D0D0D',  // near-black — was #1A1A1A
          card:    '#0A0A0A',  // deep black card — was #171717
        },
      },
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'serif'],
        inter:  ['var(--font-inter)',  'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'ulos-pattern':    "url('/patterns/ulos.svg')",
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(139, 0, 0, 0.15)',  // updated to match new primary
        'gold':  '0 0 20px rgba(212, 175, 55, 0.3)',     // unchanged
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideIn: {
          '0%':   { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
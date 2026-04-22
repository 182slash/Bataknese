import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

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
          DEFAULT: '#8B0000',
          dark:    '#5C0000',
          light:   '#B91C1C',
        },
        gold: {
          DEFAULT: '#D4AF37',
          dark:    '#B8941F',
          light:   '#E5C453',
        },
        dark: {
          DEFAULT: '#000000',
          lighter: '#0D0D0D',
          card:    '#0A0A0A',
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

      // ── Backdrop blur steps ──────────────────────────────────────
      backdropBlur: {
        xs:  '4px',
        sm:  '8px',    // glass-0
        md:  '16px',
        lg:  '20px',   // glass-1 (base)
        xl:  '32px',   // glass-2 (raised)
        '2xl': '40px', // navbar / dropdown
        '3xl': '48px', // glass-3 (heavy)
        '4xl': '64px',
      },

      // ── Box shadows ──────────────────────────────────────────────
      boxShadow: {
        // Legacy
        'glass': '0 8px 32px 0 rgba(139, 0, 0, 0.15)',
        'gold':  '0 0 20px rgba(212, 175, 55, 0.3)',

        // Frosted glass depth stack
        'glass-base':     '0 4px 24px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.10)',
        'glass-raised':   '0 8px 40px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.14)',
        'glass-elevated': '0 16px 64px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.18)',

        // Glow accents
        'glow-red':    '0 0 32px rgba(139,0,0,0.45), 0 0 64px rgba(139,0,0,0.15)',
        'glow-red-sm': '0 0 18px rgba(139,0,0,0.30)',
        'glow-gold':   '0 0 20px rgba(212,175,55,0.22)',
      },

      // ── Border colors ────────────────────────────────────────────
      borderColor: {
        'glass-0':    'rgba(255,255,255,0.08)',
        'glass-1':    'rgba(255,255,255,0.12)',
        'glass-2':    'rgba(255,255,255,0.16)',
        'glass-3':    'rgba(255,255,255,0.20)',
        'glass-red':  'rgba(185,28,28,0.28)',
        'glass-gold': 'rgba(212,175,55,0.20)',
      },

      // ── Background colors (glass fills) ─────────────────────────
      backgroundColor: {
        'glass-0':       'rgba(255,255,255,0.04)',
        'glass-1':       'rgba(255,255,255,0.06)',
        'glass-1-hover': 'rgba(255,255,255,0.10)',
        'glass-2':       'rgba(255,255,255,0.09)',
        'glass-2-hover': 'rgba(255,255,255,0.13)',
        'glass-3':       'rgba(255,255,255,0.11)',
        'glass-red':     'rgba(139,0,0,0.18)',
        'glass-gold':    'rgba(212,175,55,0.08)',
        'glass-inset':   'rgba(0,0,0,0.28)',
      },

      // ── Animations ───────────────────────────────────────────────
      animation: {
        'fade-in':        'fadeIn 0.5s ease-in-out',
        'slide-up':       'slideUp 0.4s ease-out',
        'slide-in':       'slideIn 0.3s ease-out',
        'glass-shimmer':  'glassShimmer 2s linear infinite',
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
        glassShimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
    },
  },

  plugins: [
    // ── Frosted Glass Component Plugin ──────────────────────────────
    // Registers .glass-{0..3}, .glass-red, .glass-gold, .glass-inset
    // as Tailwind components so they work with arbitrary-value syntax
    // and respect the JIT purge.
    plugin(({ addComponents, addUtilities }) => {

      addComponents({
        // Layer 0 — barely-there
        '.glass-0': {
          background:               'rgba(255,255,255,0.04)',
          backdropFilter:           'blur(8px) saturate(120%)',
          WebkitBackdropFilter:     'blur(8px) saturate(120%)',
          border:                   '1px solid rgba(255,255,255,0.08)',
          boxShadow:                '0 2px 12px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.06)',
        },

        // Layer 1 — base glass (cards, sections)
        '.glass-1': {
          background:               'rgba(255,255,255,0.06)',
          backdropFilter:           'blur(20px) saturate(150%)',
          WebkitBackdropFilter:     'blur(20px) saturate(150%)',
          border:                   '1px solid rgba(255,255,255,0.12)',
          boxShadow:                '0 4px 24px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.10)',
          transition:               'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
          '&:hover': {
            background:             'rgba(255,255,255,0.10)',
            borderColor:            'rgba(255,255,255,0.18)',
            boxShadow:              '0 8px 40px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 18px rgba(139,0,0,0.30)',
          },
        },

        // Layer 2 — raised glass (modals, popovers)
        '.glass-2': {
          background:               'rgba(255,255,255,0.09)',
          backdropFilter:           'blur(32px) saturate(170%)',
          WebkitBackdropFilter:     'blur(32px) saturate(170%)',
          border:                   '1px solid rgba(255,255,255,0.16)',
          boxShadow:                '0 8px 40px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.14)',
          transition:               'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
          '&:hover': {
            background:             'rgba(255,255,255,0.13)',
            borderColor:            'rgba(255,255,255,0.22)',
            boxShadow:              '0 16px 64px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.18), 0 0 18px rgba(139,0,0,0.30)',
          },
        },

        // Layer 3 — heavy glass (sidebars, hero overlays)
        '.glass-3': {
          background:               'rgba(255,255,255,0.11)',
          backdropFilter:           'blur(48px) saturate(180%)',
          WebkitBackdropFilter:     'blur(48px) saturate(180%)',
          border:                   '1px solid rgba(255,255,255,0.20)',
          boxShadow:                '0 16px 64px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.18)',
        },

        // Red-tinted (alerts, active states)
        '.glass-red': {
          background:               'rgba(139,0,0,0.18)',
          backdropFilter:           'blur(24px) saturate(160%)',
          WebkitBackdropFilter:     'blur(24px) saturate(160%)',
          border:                   '1px solid rgba(185,28,28,0.28)',
          boxShadow:                '0 4px 24px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.10), 0 0 18px rgba(139,0,0,0.30)',
          transition:               'all 0.25s ease',
          '&:hover': {
            background:             'rgba(139,0,0,0.24)',
            borderColor:            'rgba(185,28,28,0.40)',
            boxShadow:              '0 8px 40px rgba(0,0,0,0.75), 0 0 32px rgba(139,0,0,0.45)',
          },
        },

        // Gold-tinted
        '.glass-gold': {
          background:               'rgba(212,175,55,0.08)',
          backdropFilter:           'blur(32px) saturate(170%)',
          WebkitBackdropFilter:     'blur(32px) saturate(170%)',
          border:                   '1px solid rgba(212,175,55,0.20)',
          boxShadow:                '0 4px 24px rgba(0,0,0,0.65), inset 0 1px 0 rgba(212,175,55,0.10)',
          transition:               'all 0.3s ease',
          '&:hover': {
            background:             'rgba(212,175,55,0.12)',
            borderColor:            'rgba(212,175,55,0.32)',
            boxShadow:              '0 8px 40px rgba(0,0,0,0.75), 0 0 20px rgba(212,175,55,0.22)',
          },
        },

        // Inset well (inputs, recessed areas)
        '.glass-inset': {
          background:               'rgba(0,0,0,0.28)',
          backdropFilter:           'blur(12px)',
          WebkitBackdropFilter:     'blur(12px)',
          border:                   '1px solid rgba(255,255,255,0.07)',
          boxShadow:                'inset 0 2px 8px rgba(0,0,0,0.60), inset 0 1px 0 rgba(0,0,0,0.40)',
        },
      });

      // ── Utility: shimmer overlay ─────────────────────────────────
      addUtilities({
        '.glass-shimmer': {
          background:           'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%) no-repeat',
          backgroundSize:       '200% 100%',
          animation:            'glassShimmer 2s linear infinite',
        },
      });
    }),
  ],
};

export default config;
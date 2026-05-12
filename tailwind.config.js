/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fffdf0',
          100: '#fff8cc',
          200: '#fff0a0',
          300: '#ffe566',
          400: '#ffd700',
          500: '#f5c400',
          600: '#d4a000',
          700: '#a87800',
          800: '#7a5500',
          900: '#4d3500',
        },
        surface: {
          50:  '#f8f9fa',
          100: '#1a1b1e',
          200: '#141517',
          300: '#0f1011',
          400: '#0a0b0c',
        }
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #ffd700 0%, #f5c400 50%, #d4a000 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0f1011 0%, #0a0b0c 100%)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0'  },
        },
        pulse_gold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,215,0,0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(255,215,0,0)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)'    },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        shimmer:    'shimmer 2s linear infinite',
        pulse_gold: 'pulse_gold 2s ease-in-out infinite',
        fadeInUp:   'fadeInUp 0.4s ease forwards',
        ticker:     'ticker 30s linear infinite',
      }
    },
  },
  plugins: [],
}
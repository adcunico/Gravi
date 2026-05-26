import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#0B0B0D',
          charcoal: '#141417',
          graphite: '#1E1E24',
          elevated: '#28282F',
        },
        gold: {
          DEFAULT: '#D4A85A',
          light: '#F2D28B',
          muted: '#C8A96B',
        },
        ivory: {
          DEFAULT: '#F7F3EA',
          secondary: '#9E9A92',
          muted: '#5A5852',
        },
        linen: {
          DEFAULT: '#F6F3EE',
          soft: '#ECE6DA',
        },
        espresso: '#2B2B2F',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 20px rgba(212,168,90,0.15)',
        'gold-lg': '0 0 40px rgba(212,168,90,0.2)',
        card: '0 8px 32px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4A85A, #F2D28B)',
        'dark-gradient': 'linear-gradient(180deg, #0B0B0D 0%, #141417 100%)',
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        'record-pulse': 'recordPulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        recordPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.15)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config

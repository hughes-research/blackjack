import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'casino-green': {
          dark: '#1a472a',
          DEFAULT: '#2d5a3d',
          light: '#3d7a4d',
        },
        'felt-green': '#35654d',
        'gold': {
          dark: '#8b6914',
          DEFAULT: '#d4af37',
          light: '#f4d03f',
          shine: '#ffd700',
        },
        'cream': '#faf8f0',
        'rich-black': '#0a0a0a',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-crimson)', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.3)',
        'gold-glow-lg': '0 0 40px rgba(212, 175, 55, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'card-deal': 'cardDeal 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        cardDeal: {
          '0%': { opacity: '0', transform: 'translateY(-50px) rotate(-10deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotate(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config




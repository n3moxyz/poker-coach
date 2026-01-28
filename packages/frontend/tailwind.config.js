/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Casino dark theme - refined palette
        background: '#0a0e12',
        'background-secondary': '#111820',
        'background-tertiary': '#171f29',
        felt: '#0d3320',
        'felt-light': '#145a38',
        'felt-dark': '#071a11',
        'felt-green': '#0f4028',
        'felt-border': '#2d5a48',
        'felt-rim': '#4a7a65',
        gold: '#f5c518',
        'gold-light': '#ffd84d',
        'gold-dark': '#c9a000',
        // Card colors
        'card-red': '#e03e3e',
        'card-black': '#1a1f26',
        // UI colors
        border: '#1e3a2f',
        'border-light': '#2d5a48',
        muted: '#5a6670',
        'muted-foreground': '#8b9299',
        // Accent colors for achievements
        'accent-blue': '#3b82f6',
        'accent-purple': '#8b5cf6',
        'accent-orange': '#f97316',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-gold': '0 0 30px rgba(245, 197, 24, 0.25), 0 0 60px rgba(245, 197, 24, 0.1)',
        'glow-gold-intense': '0 0 20px rgba(245, 197, 24, 0.5), 0 0 40px rgba(245, 197, 24, 0.3)',
        'glow-green': '0 0 30px rgba(20, 90, 56, 0.4)',
        card: '0 8px 16px -4px rgba(0, 0, 0, 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 16px 32px -8px rgba(0, 0, 0, 0.5), 0 8px 16px -4px rgba(0, 0, 0, 0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'felt-texture':
          'radial-gradient(ellipse at 30% 20%, #145a38 0%, #0d3320 40%, #071a11 100%)',
        'felt-noise': `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        'card-pattern':
          'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        'chip-pattern': 'repeating-conic-gradient(from 0deg, #f5c518 0deg 20deg, #c9a000 20deg 40deg)',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'fire': 'fire 0.4s ease-in-out infinite alternate',
        'confetti': 'confetti 1s ease-out forwards',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 0.5s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'card-flip': 'card-flip 0.6s ease-in-out',
        'xp-pop': 'xp-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'streak-fire': 'streak-fire 1.5s ease-in-out infinite',
        'stagger-1': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both',
        'stagger-2': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
        'stagger-3': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
        'stagger-4': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(245, 197, 24, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(245, 197, 24, 0.5)' },
        },
        fire: {
          '0%': { transform: 'scale(1) rotate(-3deg)', filter: 'brightness(1)' },
          '100%': { transform: 'scale(1.15) rotate(3deg)', filter: 'brightness(1.1)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-150px) rotate(720deg) scale(0)', opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'bounce-subtle': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(245, 197, 24, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 16px rgba(245, 197, 24, 0.7))' },
        },
        'card-flip': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        'xp-pop': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '60%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'streak-fire': {
          '0%': { transform: 'scale(1) translateY(0)', filter: 'hue-rotate(0deg)' },
          '25%': { transform: 'scale(1.1) translateY(-2px)', filter: 'hue-rotate(-10deg)' },
          '50%': { transform: 'scale(1.05) translateY(-1px)', filter: 'hue-rotate(10deg)' },
          '75%': { transform: 'scale(1.15) translateY(-3px)', filter: 'hue-rotate(-5deg)' },
          '100%': { transform: 'scale(1) translateY(0)', filter: 'hue-rotate(0deg)' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

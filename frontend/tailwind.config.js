/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        navy: {
          50:  '#e8ecf4',
          100: '#c5cfe5',
          200: '#9eaed4',
          300: '#778dc3',
          400: '#5b75b7',
          500: '#3f5dab',
          600: '#3755a4',
          700: '#2d4a9a',
          800: '#264091',
          900: '#192f7e',
          950: '#0A1628',
        },
        // Accent Electric Blue
        accent: {
          50:  '#f0f7ff',
          100: '#e0efff',
          200: '#b8dcff',
          300: '#7ec0ff',
          400: '#3ba1ff',
          500: '#0072ff',
          600: '#005ee6',
          700: '#004bc2',
          800: '#003e9e',
          900: '#003585',
        },
        // Gold mapped to Spring Green / Teal Green for awards
        gold: {
          300: '#3affab',
          400: '#00ffa2',
          500: '#00ff87',
          600: '#00e676',
        },
        // Surface
        surface: {
          DEFAULT: '#0f1e35',
          50:  '#1a2e48',
          100: '#16263e',
          200: '#0f1e35',
          300: '#0b1828',
          400: '#07101c',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Outfit', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero':     'linear-gradient(135deg, #0A1628 0%, #1a2e48 50%, #0d1f3c 100%)',
        'gradient-card':     'linear-gradient(135deg, rgba(0,114,255,0.1) 0%, rgba(0,255,135,0.05) 100%)',
        'gradient-accent':   'linear-gradient(135deg, #0072ff 0%, #00ff87 100%)',
        'gradient-gold':     'linear-gradient(135deg, #0052d4 0%, #00ff87 100%)',
        'noise':             "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'glow':        '0 0 30px rgba(0,114,255,0.3)',
        'glow-gold':   '0 0 30px rgba(0,255,135,0.3)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':  '0 8px 40px rgba(0,114,255,0.25)',
      },
      animation: {
        'fade-in':      'fadeIn 0.6s ease-out forwards',
        'slide-up':     'slideUp 0.6s ease-out forwards',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':        'float 6s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(24px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        float:   { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

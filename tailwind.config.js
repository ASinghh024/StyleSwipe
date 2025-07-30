/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Apple Dark Theme Colors
        dark: {
          bg: '#121212',
          surface: '#1C1C1E',
          card: '#2C2C2E',
          border: '#38383A',
          text: {
            primary: '#F5F5F7',
            secondary: '#E5E5EA',
            tertiary: '#98989F',
          }
        },
        // Apple Accent Colors - Minimal and Muted
        accent: {
          blue: '#007AFF',
          'blue-muted': '#0A84FF',
          green: '#30D158',
          'green-muted': '#32D74B',
        },
        // System Colors
        system: {
          red: '#FF453A',
          orange: '#FF9F0A',
          yellow: '#FFD60A',
        }
      },
      fontFamily: {
        // Apple San Francisco font stack
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // Apple-inspired typography scale
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '0.005em' }],
        'lg': ['18px', { lineHeight: '28px', letterSpacing: '0.005em' }],
        'xl': ['20px', { lineHeight: '32px', letterSpacing: '0.005em' }],
        '2xl': ['24px', { lineHeight: '36px', letterSpacing: '0.005em' }],
        '3xl': ['30px', { lineHeight: '40px', letterSpacing: '0.005em' }],
        '4xl': ['36px', { lineHeight: '48px', letterSpacing: '0.01em' }],
        '5xl': ['48px', { lineHeight: '56px', letterSpacing: '0.01em' }],
        '6xl': ['60px', { lineHeight: '72px', letterSpacing: '0.01em' }],
      },
      animation: {
        // Apple-style smooth animations
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        // Apple-style shadows
        'apple': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'apple-lg': '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
        'apple-xl': '0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'apple': '20px',
      },
    },
  },
  plugins: [],
} 
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        background: {
          light: '#F7F7F5',
          dark: '#111111',
          subtle: '#EFEFED',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#181818',
          hoverLight: '#F3F4F6',
          hoverDark: '#222222',
        },
        border: {
          light: '#E5E5E2',
          dark: '#333333',
        },
        text: {
          primary: '#111111',
          secondary: '#6B6B6B',
          muted: '#8A8A86',
          darkPrimary: '#FFFFFF',
          darkSecondary: '#A1A1AA',
        },
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#FF6B00',
          600: '#E66000',
          700: '#CC5500',
        },
        accent: {
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
        },
      },
      boxShadow: {
        'saas': '0 4px 20px -2px rgba(0, 0, 0, 0.03), 0 1px 3px -1px rgba(0, 0, 0, 0.02)',
        'elevation': '0 10px 40px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

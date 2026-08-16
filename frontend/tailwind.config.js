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
        heading: ['Oswald', 'sans-serif'],
      },
      colors: {
        background: {
          light: '#F9FAFB',
          dark: '#000000',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#111111',
          hoverLight: '#F3F4F6',
          hoverDark: '#222222',
        },
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#FF6B00',
          600: '#E66000',
          700: '#CC5500',
          glow: '#FF8533',
        },
        accent: {
          500: '#F8F9FB',
          600: '#E2E8F0',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
        },
      },
      boxShadow: {
        'saas': '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'saas-dark': '0 4px 25px -2px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        'glow': '0 0 25px -5px rgba(255, 107, 0, 0.4)',
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

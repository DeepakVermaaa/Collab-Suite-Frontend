/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,ts}",
    ],
    theme: {
      extend: {
        colors: {
          gray: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          },
          indigo: {
            500: '#6366F1',
          },
          green: {
            100: '#DCFCE7',
            500: '#22C55E',
            800: '#166534',
          },
          yellow: {
            100: '#FEF9C3',
            500: '#EAB308',
            800: '#854D0E',
          },
          red: {
            500: '#EF4444',
          }
        }
      },
    },
    plugins: [
      require('@tailwindcss/line-clamp'),
    ],
  }
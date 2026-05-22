/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#0F766E',
          light:   '#CCFBF1',
          dark:    '#0D5E57',
        },
        accent: {
          DEFAULT: '#10B981',
          light:   '#D1FAE5',
        },
        navy:    '#0F172A',
        surface: '#F8FAFC',
        ink:     '#0F172A',
        muted: {
          DEFAULT: '#64748B',
          light:   '#94A3B8',
        },
        line: '#E2E8F0',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(15,23,42,0.04)',
        sm: '0 1px 2px rgba(15,23,42,0.05)',
        md: '0 1px 3px rgba(15,23,42,0.07), 0 1px 2px rgba(15,23,42,0.04)',
        lg: '0 4px 16px rgba(15,23,42,0.08)',
        xl: '0 8px 32px rgba(15,23,42,0.10)',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Primary accent: Blue ───────────────────────────────────────────
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Blue core accent
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // ── Secondary accent: Green ────────────────────────────────────────
        accent: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Green accent
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // ── Surface / background tokens ────────────────────────────────────
        surface: {
          base:   '#f8fafc',   // Page background
          card:   '#ffffff',   // Card surface
          raised: '#f1f5f9',   // Slightly raised panels
          border: '#e2e8f0',   // Borders
          hover:  '#f8fafc',   // Hover surface
        },
        // ── Typography tokens ──────────────────────────────────────────────
        ink: {
          900: '#0f172a',   // Headings
          700: '#1e293b',   // Body strong
          500: '#475569',   // Body default
          400: '#64748b',   // Muted text
          300: '#94a3b8',   // Placeholder / subtle
          200: '#cbd5e1',   // Disabled
        },
      },
      fontFamily: {
        sans:    ['Inter', 'Outfit', 'sans-serif'],
        heading: ['Inter', 'Outfit', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card':   '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md':'0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'card-lg':'0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
        'brand':  '0 4px 14px 0 rgb(59 130 246 / 0.25)',
        'accent': '0 4px 14px 0 rgb(34 197 94 / 0.25)',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':      'shimmer 1.8s linear infinite',
        'fade-in':      'fadeIn 0.25s ease-out',
        'slide-up':     'slideUp 0.2s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

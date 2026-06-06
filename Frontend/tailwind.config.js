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
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "#99BC85",
          hover: "#7EA669",
          dark: "#648C50",
          light: "#B5D4A3",
        },
        secondary: {
          DEFAULT: "#E2E8F0", /* slate-200 */
          hover: "#CBD5E1", /* slate-300 */
          dark: "#94A3B8", /* slate-400 */
          light: "#F1F5F9", /* slate-100 */
        },
        accent: {
          DEFAULT: "#14B8A6", /* Teal-500 */
          hover: "#0D9488",
          dark: "#0F766E",
          light: "#5EEAD4",
        },
        muted: {
          DEFAULT: "#F1F5F9", /* slate-100 */
          foreground: "#64748B", /* slate-500 */
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "rgba(226, 232, 240, 0.8)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

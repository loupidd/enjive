/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── EnJive Brand Palette ─────────────────────────────
        denim: {
          50:  "#e6eef4",
          100: "#ccdde9",
          200: "#99bbd4",
          300: "#6699be",
          400: "#3377a9",
          500: "#02314E",   // Dark Denim Blue – primary
          600: "#022a44",
          700: "#02233a",
          800: "#011c2f",
          900: "#011525",
          950: "#000d17",
        },
        brown: {
          DEFAULT: "#7A4A00",  // Gédéon Brown
          light:   "#9c6200",
          dark:    "#5a3600",
        },
        caramel: {
          DEFAULT: "#FFC677",  // Mead / Caramel – warm accent
          50:  "#fff8ee",
          100: "#ffefd4",
          200: "#ffdfa9",
          300: "#ffcf7e",
          400: "#FFC677",
          500: "#ffb84d",
          600: "#e09a2a",
          700: "#b87a18",
        },
        // ── UI Surfaces ──────────────────────────────────────
        surface: {
          DEFAULT: "#0d1c27",
          50:  "#EDEDED",
          100: "#d4d4d4",
          700: "#1a2e3e",
          800: "#122030",
          900: "#0a1820",
          950: "#060f16",
        },
        ink: "#333333",
      },
      fontFamily: {
        sans: ["'Work Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
  darkMode: "class",
};

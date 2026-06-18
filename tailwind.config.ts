import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#22c55e", // 🟢 vert principal
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        background: {
          light: "#f9fafb", // blanc cassé
        },
        dark: {
          900: "#0a0a0a",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
    },
  },
  plugins: [],
};

export default config;

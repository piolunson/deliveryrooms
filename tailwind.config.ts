import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#2F6FEB",
          dark: "#1E52C2",
        },
        ink: "#1A1A1A",
        success: "#3FA66B",
        danger: "#D64545",
        amber: "#E0A030",
        star: "#E8A317",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        serif: ["var(--font-garamond)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "16px",
        tile: "12px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        drift: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(2%, -2%) scale(1.05)" },
          "100%": { transform: "translate(0,0) scale(1)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        drift: "drift 20s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

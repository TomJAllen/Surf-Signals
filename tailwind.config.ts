import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-6px)" },
          "40%, 80%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ink: "#1C1917",
        sand: "#F3E2BC",
        sea: { DEFAULT: "#0E6A8C", dark: "#0A4F69" },
        correct: "#1F8A3E",
        // Official Surf Life Saving Australia colors
        slsa: {
          pink: {
            DEFAULT: "#FF2D8A",
            light: "#FF6AAE",
            dark: "#D41A6F",
          },
          yellow: {
            DEFAULT: "#FFE135",
            light: "#FFED6F",
            dark: "#E6C400",
          },
          green: {
            DEFAULT: "#7CFC00",
            light: "#9FFF4D",
            dark: "#5CBF00",
          },
          red: {
            DEFAULT: "#DA291C",
            light: "#FF4D42",
            dark: "#B31B10",
          },
        },
        // Semantic colors for the app
        primary: {
          DEFAULT: "#DA291C", // SLSA Red
          light: "#FF4D42",
          dark: "#B31B10",
        },
        secondary: {
          DEFAULT: "#FFE135", // SLSA Yellow
          light: "#FFED6F",
          dark: "#E6C400",
        },
        accent: {
          DEFAULT: "#FF2D8A", // SLSA Pink
          light: "#FF6AAE",
          dark: "#D41A6F",
        },
        success: {
          DEFAULT: "#7CFC00", // SLSA Green
          light: "#9FFF4D",
          dark: "#5CBF00",
        },
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vert du drapeau algérien (#006233)
        brand: {
          50: "#f3faf6",
          100: "#e3f3ea",
          200: "#c5e6d3",
          300: "#95d0b0",
          400: "#4eaf7a",
          500: "#1a8f56",
          600: "#007a40",
          700: "#006233",
          800: "#004e29",
          900: "#00361c",
        },
        // Rouge du croissant et de l'étoile (#D21034)
        ai: {
          50: "#fff1f3",
          100: "#ffe0e5",
          200: "#ffc6ce",
          300: "#ff97a6",
          400: "#f25b72",
          500: "#d21034",
          600: "#b50d2c",
          700: "#960b26",
          800: "#7a0c24",
          900: "#450812",
        },
        success: {
          50: "#f3faf6",
          100: "#e3f3ea",
          200: "#c5e6d3",
          300: "#95d0b0",
          400: "#4eaf7a",
          500: "#1a8f56",
          600: "#007a40",
          700: "#006233",
          800: "#004e29",
          900: "#00361c",
        },
        gold: {
          100: "#ffe0e5",
          600: "#d21034",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Inter", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        code: ["var(--font-code)", "monospace"],
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};

export default config;

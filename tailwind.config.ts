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
        teal: {
          50:  "#f0f9fa",
          100: "#d9f0f3",
          200: "#b3e1e7",
          300: "#7fcad3",
          400: "#59A7B1",
          500: "#3d8e99",
          600: "#2f7380",
          700: "#265e68",
          800: "#1f4d56",
          900: "#1a3f47",
        },
        gray: {
          50:  "#f7f7f7",
          100: "#ebebeb",
          200: "#d4d4d3",
          300: "#b5b5b4",
          400: "#909090",
          500: "#70706E",
          600: "#5a5a58",
          700: "#4a4a48",
          800: "#3d3d3b",
          900: "#2e2e2c",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

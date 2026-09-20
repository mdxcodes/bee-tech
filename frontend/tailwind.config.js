/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        sand: {
          50: "#fdf8f0",
          100: "#fdf2e4",
          200: "#fae7cc",
          300: "#f5d9a8",
          400: "#e8c78a",
          500: "#d4a574",
          600: "#c4915e",
          700: "#a67847",
          800: "#8a6539",
          900: "#6e5230",
        },
        shell: {
          DEFAULT: "#ff7f50",
          light: "#ffa07a",
          dark: "#e06030",
        },
        palm: {
          DEFAULT: "#2d6a4f",
          light: "#40916c",
          dark: "#1b4332",
        },
      },
    },
  },
  plugins: [],
};

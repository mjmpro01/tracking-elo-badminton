/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2b6cee",
        "primary-content": "#ffffff",
        "primary-dark": "#1e4fd4",
        "primary-light": "#5b8ef0",
        "background-light": "#f6f6f8",
        "background-dark": "#101622"
      },
      fontFamily: {
        display: ["Lexend", "sans-serif"]
      }
    }
  },
  plugins: []
};


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
        primary: "#137fec",
        "primary-content": "#ffffff",
        "primary-dark": "#0b5bb0",
        "primary-light": "#54a3f2",
        "background-light": "#f6f7f8",
        "background-dark": "#101922"
      },
      fontFamily: {
        display: ["Lexend", "sans-serif"]
      }
    }
  },
  plugins: []
};


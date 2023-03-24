const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./components/**/*.js", "./pages/**/*.js", "./styles/globals.css"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "spin-one-time": "spin 0.3s linear",
      },
      colors: {
        ...colors,
        dark: "#000000",
        light: "#ffffff",
        black: "#1a1919",
        white: "#ececec",
        slate: {
          ...colors.slate,
          900: "#0E151B ",
          800: "#0E1E1F",
          700: "#0E1E1F",
          750: "#234f03",
          600: "#4a4a4a",
          500: "#a5a5a5",
          400: "#b5b5b5",
          300: "#cbcbcb",
          200: "#d6d6d6",
          100: "#e1e1e1",
          50: "#f0f0f0",
        },
      },
    },
  },
};

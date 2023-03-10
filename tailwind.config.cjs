/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        h1: "3rem",
      },
    },
    fontFamily: {
      body: ["JetBrains Mono", "monospace"],
    },
  },
  plugins: [],
};

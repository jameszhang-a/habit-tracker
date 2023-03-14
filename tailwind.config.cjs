// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require("tailwindcss/plugin");

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
  plugins: [
    plugin(function ({ addUtilities }) {
      const utilities = {
        ".animation-delay-50": {
          "animation-delay": "50ms",
        },
        ".animation-delay-100": {
          "animation-delay": "100ms",
        },
        ".animation-delay-150": {
          "animation-delay": "150ms",
        },
      };

      addUtilities(utilities);
    }),
  ],
};

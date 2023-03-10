// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        h1: "3rem",
      },
      backgroundImage: {
        "gradient-full":
          "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
      },
      backgroundSize: {
        huge: "400% 400%",
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

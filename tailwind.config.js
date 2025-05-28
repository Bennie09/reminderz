// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "dark:bg-black",
    // Add other dynamic classes here
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        winky: ['"Winky Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

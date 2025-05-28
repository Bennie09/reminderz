// tailwind.config.js
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "dark:bg-black",
    "dark:text-white",
    "bg-white",
    "text-black",
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

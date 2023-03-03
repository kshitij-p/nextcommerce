/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        neutral: {
          1000: "#0d0d0d"
        }
      }
    },
  },
  plugins: [
    require('@headlessui/tailwindcss')
  ],
};

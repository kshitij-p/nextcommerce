/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        neutral: {
          1000: "hsl(180 4% 5%)",
        },
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
};

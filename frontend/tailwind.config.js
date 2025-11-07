// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: ["text-[#1D1B20]", "bg-[#F2F2F2]", "hover:bg-[#F2F2F2]"],
  theme: {
    extend: {
      fontFamily: {
        // set Karla as default "sans"
        sans: ["Karla", "ui-sans-serif", "system-ui", "sans-serif"],
        karla: ["Karla", "sans-serif"],
        kapakana: ["Kapakana", "serif"],
      },
    },
  },
  plugins: [],
}

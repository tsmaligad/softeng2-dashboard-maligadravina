// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  // ✅ Prevent purge for classes you build via variables/template strings
  safelist: [
    "text-[#1D1B20]",
    "bg-[#F2F2F2]",
    "hover:bg-[#F2F2F2]",
  ],

  theme: {
    extend: {
      fontFamily: { kapakana: ["Kapakana", "serif"] },
    },
  },
  plugins: [],
}

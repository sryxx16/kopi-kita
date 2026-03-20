/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Penting untuk fitur Dark Mode KopiKita
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#10b981", // Emerald-500 khas KopiKita
        },
      },
    },
  },
  plugins: [],
};

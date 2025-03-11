/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can extend the default theme here if needed
    },
  },
  darkMode: 'class', // Enables dark mode with 'dark' class
  plugins: [],
}
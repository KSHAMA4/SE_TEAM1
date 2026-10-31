/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pes: {
          blue: '#1E3A8A',
          gold: '#F59E0B'
        }
      }
    },
  },
  plugins: [],
}

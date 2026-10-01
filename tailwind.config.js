/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"IBM Plex Sans"', '"Inter Tight"', 'system-ui', 'sans-serif'],
        inter: ['"Inter Tight"', 'sans-serif'],
        geist: ['"Geist"', 'sans-serif'],
      },
      colors: {
        accent: {
          dark: '#1e1e1e',
          muted: '#8a857d',
          lightMuted: '#b7b2aa',
          border: '#f1eee9',
          card: '#e7eef0',
        }
      }
    },
  },
  plugins: [],
}

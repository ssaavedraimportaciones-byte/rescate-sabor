/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores de marca del logo oficial
        // Naranja: #f57c00 · Verde: #1b7a30
        orange: {
          50:  '#fff8f0',
          100: '#ffe8cc',
          200: '#ffd099',
          300: '#ffb866',
          400: '#ff9933',
          500: '#f57c00',
          600: '#d96e00',
          700: '#b35a00',
          800: '#8c4700',
          900: '#663300',
        },
        green: {
          50:  '#f0f9f2',
          100: '#d6f0dc',
          200: '#aaddb6',
          300: '#7dc990',
          400: '#4db66b',
          500: '#2d9d47',
          600: '#1b7a30',
          700: '#156626',
          800: '#0f521d',
          900: '#093d15',
        },
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        valex: {
          primary: '#3858f9',
          primaryHover: '#2d4be0',
          success: '#22c03c',
          danger: '#f7557a',
          warning: '#ff964b',
          info: '#1170e4',
          background: '#f0f1f7',
          card: '#ffffff',
          darkBg: '#1a1d21',
          darkCard: '#24272c'
        }
      },
      boxShadow: {
        'valex': '0 5px 10px rgba(20, 20, 20, 0.05)',
        'valex-lg': '0 8px 16px rgba(20, 20, 20, 0.08)',
      },
      borderRadius: {
        'valex': '10px',
      }
    },
  },
  plugins: [],
}

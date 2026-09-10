/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bauhaus: {
          red: '#D9381E',
          blue: '#0F4C81',
          yellow: '#F5A623',
          green: '#2D7F54',
          black: '#121212',
          concrete: '#F0EFEA',
          white: '#FFFFFF',
          paper: '#F7F6F2',
          border: '#121212',
        }
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', '"Cascadia Code"', 'Consolas', 'monospace']
      },
      boxShadow: {
        'bauhaus': '4px 4px 0px #121212',
        'bauhaus-lg': '6px 6px 0px #121212',
        'bauhaus-sm': '2px 2px 0px #121212',
        'bauhaus-red': '4px 4px 0px #D9381E',
        'bauhaus-blue': '4px 4px 0px #0F4C81',
        'bauhaus-yellow': '4px 4px 0px #F5A623',
      }
    },
  },
  plugins: [],
}

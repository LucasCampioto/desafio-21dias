/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        beige: {
          DEFAULT: '#E6E3D6',
          light: '#EAE8DE',
        },
        sage: '#9EA08F',
        lime: {
          DEFAULT: '#D4F268',
          hover: '#C3E354',
        },
        pale: {
          yellow: '#FBFCD4',
          pink: '#EBC8D6',
          blue: '#C4C9D9',
        },
      },
      fontFamily: {
        sans: ['Instrument Sans', 'sans-serif'],
        serif: ['Newsreader', 'serif'],
      },
      keyframes: {
        'aurora-dot-wave': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'aurora-text-wave': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'aurora-dot-wave': 'aurora-dot-wave 0.55s ease-in-out infinite',
        'aurora-text-wave': 'aurora-text-wave 0.9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

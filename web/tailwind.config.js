/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'h-6', 'h-8', 'h-10', 'h-12', 'h-16',
    'px-3', 'py-1.5', 'px-4', 'py-2', 'px-6', 'py-3',
    'bg-black', 'bg-green-600', 'bg-blue-600', 'bg-gray-600', 'bg-red-600',
    'hover:bg-gray-800', 'hover:bg-green-700', 'hover:bg-blue-700', 'hover:bg-gray-700', 'hover:bg-red-700',
    'text-white', 'text-gray-900',
    'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-full',
    'mb-4', 'mb-6', 'mb-8',
    'font-normal', 'font-medium', 'font-semibold', 'font-bold',
    'inline-flex', 'items-center', 'justify-center', 'transition-colors',
    'disabled:opacity-50', 'disabled:cursor-not-allowed',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#3d3d3d',
          900: '#2b2b2b',
          950: '#000000',
        },
        icon: '#000000',
      },
    },
  },
  plugins: [],
}
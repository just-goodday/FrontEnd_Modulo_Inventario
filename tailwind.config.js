/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: { primary: "#13c888" },
      boxShadow: { soft: "0 4px 12px rgba(0,0,0,0.06)" },
    },
  },
  safelist: [
    'bg-green-100/50','bg-blue-100/50','bg-red-100/50','bg-purple-100/50',
    'text-green-600','text-blue-600','text-red-600','text-purple-600',
    'hover:shadow-green-200','hover:shadow-blue-200','hover:shadow-red-200','hover:shadow-purple-200',
    'bg-green-500/20','bg-red-500/20','bg-blue-500/20','bg-purple-500/20',
    'bg-green-500','bg-blue-500','bg-red-500','bg-purple-500',
    'text-green-500','text-blue-500','text-red-500','text-purple-500',
  ],
  plugins: [],
}

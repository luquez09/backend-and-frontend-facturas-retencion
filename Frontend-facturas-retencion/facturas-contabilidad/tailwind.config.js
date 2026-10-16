/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        softGreen: {
          50: "#f0fdf4",
          100: "#dcfce7",
          700: "#15803d",
          800: "#166534",
        },
        softRed: {
          50: "#fef2f2",
          100: "#fee2e2",
          700: "#b91c1c",
          800: "#991b1b",
        },
        softAmber: {
          50: "#fffbeb",
          100: "#fef3c7",
          700: "#b45309",
          800: "#92400e",
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: {
          50: "#F4F6FB",
          900: "#0B1120",
          800: "#111A2E",
          700: "#182338",
          600: "#26334D",
        },
        signal: {
          cyan: "#4FD1E8",
          amber: "#F5A65B",
          green: "#5FD98A",
          violet: "#9B8CFF",
          rose: "#F26D6D",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          background: "#050505",
          sidebar: "#0D0D0D",
          card: "#121212",
          crystal: "#00E5FF",
          crystal2: "#0099FF",
          text: {
            DEFAULT: "#FFFFFF",
            secondary: "#71717A",
          },
        },
      },
      boxShadow: {
        glow: "0 0 25px rgba(0, 229, 255, 0.4)",
        glowSoft: "0 0 15px rgba(0, 229, 255, 0.2)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

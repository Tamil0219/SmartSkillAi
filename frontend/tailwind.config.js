/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          background: "#070B1D",
          navbar: "#0B1126",
          sidebar: "#0A1025",
          card: "#131A35",
          crystal: "#1DA1FF",
          crystal2: "#7B4DFF",
          cyan: "#24E0FF",
          pink: "#F53DA5",
          success: "#2ED47A",
          warning: "#FFC857",
          danger: "#FF5C7A",
          text: {
            DEFAULT: "#FFFFFF",
            secondary: "#B4BDD8",
            muted: "#7C88A5",
            disabled: "#59637F",
          },
        },
      },
      boxShadow: {
        glow: "0 0 25px rgba(29, 161, 255, 0.25)",
        glowSoft: "0 0 20px rgba(123, 77, 255, 0.18)",
        panel: "0 10px 35px rgba(0, 0, 0, 0.45)",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
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

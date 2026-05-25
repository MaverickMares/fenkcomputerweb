/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fenk: {
          red: "#e63535",
          "red-dark": "#b82828",
          black: "#0d0d0d",
          dark: "#1a1a1a",
          card: "#141414",
          border: "#2a2a2a",
        },
      },
      fontFamily: {
        heading: ["'Rajdhani'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out both",
        "slide-up": "slideUp 0.5s ease-out both",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(230,53,53,0.4)" },
          "50%": { boxShadow: "0 0 20px rgba(230,53,53,0.8)" },
        },
      },
      boxShadow: {
        "red-glow": "0 0 15px rgba(230,53,53,0.5)",
        "red-glow-sm": "0 0 8px rgba(230,53,53,0.3)",
      },
    },
  },
  plugins: [],
}

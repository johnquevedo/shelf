import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#09111f",
        midnight: "#0f1728",
        card: "#131f35",
        line: "#22304d",
        accent: "#f4b860",
        mint: "#99d7c7",
        mist: "#ecf2fb"
      },
      fontFamily: {
        sans: ["Manrope", "Avenir Next", "Segoe UI", "sans-serif"],
        display: ["Fraunces", "Iowan Old Style", "Georgia", "serif"]
      },
      boxShadow: {
        glow: "0 20px 60px rgba(5, 11, 25, 0.35)"
      },
      backgroundImage: {
        "navy-grid":
          "radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 32%), linear-gradient(135deg, rgba(255,255,255,0.04) 1px, transparent 0)",
        "warm-fade":
          "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(243,237,227,0.96) 100%)"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;

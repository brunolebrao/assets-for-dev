import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F8FAFC",
        card: "#EEF2F7",
        text: "#0B0F14",
        textMuted: "#1C2430",
        border: "#D7DEE8",
        accent: "#2F6BFF",
        accentSoft: "#E8F0FF",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      borderRadius: {
        md: "12px",
        lg: "14px",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(15,23,42,.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;

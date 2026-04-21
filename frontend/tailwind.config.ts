import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "Segoe UI", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        sahib: {
          ocean: "#3A8AAF",
          slate: "#252526",
          deep: "#1E1E1E",
        },
      },
      backgroundImage: {
        "sahib-page": "linear-gradient(180deg, #1E1E1E 0%, #1E1E1E 100%)",
      },
      boxShadow: {
        studio:
          "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "studio-md":
          "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "sahib-glow": "0 8px 32px rgba(0, 0, 0, 0.3)",
        "sahib-ring": "0 0 24px rgba(58, 138, 175, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;

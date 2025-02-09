import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',  // 🌙 ダークモード対応
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1E1E1E",
        foreground: "#EAEAEA",
        primary: "#007AFF",
        secondary: "#6c757d",
        accent: "#ffcc00",
        border: "#d1d5db",
      },
    },
  },
  plugins: [],
};

export default config;

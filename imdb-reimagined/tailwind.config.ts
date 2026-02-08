import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        imdb: {
          gold: "#f5c518",
          black: "#161616",
          white: "#f5f5f5",
          gray: "#969696",
        },
      },
      backgroundImage: {
        "imdb-gradient": "linear-gradient(135deg, #f9dc74, #f5c518, #ff6800)",
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-inter-tight)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

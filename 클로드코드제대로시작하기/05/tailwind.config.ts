import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // enable class-based dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1', // indigo-500 as main accent color
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      borderRadius: {
        sm: '8px',   // rounded-sm -> 8px
        md: '12px',  // rounded-md -> 12px
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', "Segoe UI", 'Roboto', "Helvetica Neue", 'Arial', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
export default config;

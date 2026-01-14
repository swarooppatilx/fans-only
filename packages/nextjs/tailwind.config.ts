import daisyui from "daisyui";

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fansonly: {
          50: "#E6F7FD",
          100: "#CCF0FB",
          200: "#99E0F7",
          300: "#66D1F3",
          400: "#33C1EF",
          500: "#00AFF0",
          600: "#0096D6",
          700: "#007AB8",
          800: "#005E8F",
          900: "#004266",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.08)",
        card: "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        btn: "1.5rem",
        badge: "1.5rem",
        card: "0.5rem",
      },
    },
  },

  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        "fansonly-light": {
          primary: "#00AFF0",
          "primary-focus": "#0096D6",
          "primary-content": "#FFFFFF",
          secondary: "#00D9FF",
          "secondary-focus": "#00C4E6",
          "secondary-content": "#FFFFFF",
          accent: "#10B981",
          "accent-focus": "#059669",
          "accent-content": "#FFFFFF",
          neutral: "#1F2937",
          "neutral-focus": "#111827",
          "neutral-content": "#FFFFFF",
          "base-100": "#FFFFFF",
          "base-200": "#F8F9FA",
          "base-300": "#E9ECEF",
          "base-content": "#000000",
          info: "#00AFF0",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
      },
    ],
  },
} as any;

export default config;

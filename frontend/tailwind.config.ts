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
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        // Premium Minimalist Palette — Light Mode
        brand: "#18181B",
        "brand-muted": "#F4F4F5",
        bg: "#FAFAFA",
        surface: "#FFFFFF",
        "surface-deep": "#F4F4F5",
        "text-primary": "#09090B",
        "text-muted": "#71717A",
        border: "#E4E4E7",
        // Risk
        "risk-high": "#EF4444",
        "risk-medium": "#F59E0B",
        "risk-low": "#10B981",
        // Dark mode surfaces (used with dark: prefix)
        "dark-bg": "#000000",
        "dark-surface": "#0A0A0A",
        "dark-surface-deep": "#171717",
        "dark-risk-high": "#EF4444",
        "dark-risk-medium": "#F59E0B",
        "dark-risk-low": "#10B981",
      },
      borderRadius: {
        card: "16px",
        badge: "12px",
        btn: "8px",
        full: "9999px",
      },
      boxShadow: {
        glass: "0 4px 24px rgba(0, 0, 0, 0.03)",
        "glass-dark": "0 4px 24px rgba(0, 0, 0, 0.5)",
        "glass-hover": "0 8px 32px rgba(0, 0, 0, 0.08)",
        "glass-hover-dark": "0 8px 32px rgba(0, 0, 0, 0.6)",
      },
      animation: {
        shimmer: "shimmer 1.5s infinite linear",
        "fade-in": "fadeIn 200ms ease",
        "slide-in-right": "slideInRight 200ms ease",
        "slide-in-up": "slideInUp 200ms ease",
        "pulse-ring": "pulseRing 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideInRight: {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        slideInUp: {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        pulseRing: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16,185,129,0.4)" },
          "50%": { boxShadow: "0 0 0 6px rgba(16,185,129,0)" },
        },
      },
      letterSpacing: {
        heading: "-0.02em",
      },
    },
  },
  plugins: [],
};

export default config;

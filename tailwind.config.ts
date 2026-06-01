import type { Config } from "tailwindcss";

/**
 * PetroBrain design tokens.
 * "Dark & technical" — industrial control-room. Deep slate base, layered surfaces,
 * ONE accent (safety-amber), semantic colors used sparingly, cool-grey neutral scale
 * tuned for WCAG AA contrast on dark.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        // Base background + layered surfaces. Channel-variable backed so the app shell
        // can theme (light/dark) via [data-app-theme]; defaults (in globals.css :root)
        // are the exact original dark hexes, so the marketing site is unchanged.
        base: "rgb(var(--c-base) / <alpha-value>)", // deep slate — page background
        surface: {
          1: "rgb(var(--c-surface-1) / <alpha-value>)", // raised panels, cards
          2: "rgb(var(--c-surface-2) / <alpha-value>)", // nested / hover surfaces
          3: "rgb(var(--c-surface-3) / <alpha-value>)", // lightest layered surface
        },
        // Single brand accent — safety-amber / HSE high-vis.
        accent: {
          DEFAULT: "#FF7A00",
          hover: "#FF8C1F",
          muted: "rgba(255,122,0,0.12)",
          contrast: "#0B0E13", // text/icon color that sits ON accent
        },
        // Semantic — used sparingly (status, stage badges, banners).
        safe: "#1FB85C",
        warn: "#FFB020",
        danger: "#FF4D4D",
        info: "#3B9EFF",
        // Cool-grey neutral scale (50 lightest → 900 darkest).
        grey: {
          50: "#F5F7FA",
          100: "#E6EAF0",
          200: "#CCD3DE",
          300: "#AEB7C5",
          400: "#8B95A6",
          500: "#6B7585",
          600: "#525B6B",
          700: "#3A4250",
          800: "#262D38",
          900: "#171C25",
        },
        // Semantic borders — channel-variable backed (theme-aware in the app shell).
        border: {
          subtle: "rgb(var(--c-border-subtle) / <alpha-value>)",
          strong: "rgb(var(--c-border-strong) / <alpha-value>)",
        },
      },
      textColor: {
        // Channel-variable backed; dark defaults preserve the original AA contrasts.
        primary: "rgb(var(--c-text-primary) / <alpha-value>)", // body
        secondary: "rgb(var(--c-text-secondary) / <alpha-value>)", // supporting copy
        muted: "rgb(var(--c-text-muted) / <alpha-value>)", // captions
        faint: "rgb(var(--c-text-faint) / <alpha-value>)", // dimmest readable text
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Fluid display sizes for hero / headings.
        display: ["clamp(2.75rem, 1.8rem + 4vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        h1: ["clamp(2.25rem, 1.6rem + 2.6vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        h2: ["clamp(1.75rem, 1.4rem + 1.4vw, 2rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        h3: ["1.375rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
      },
      maxWidth: {
        container: "1200px",
        prose: "68ch",
      },
      spacing: {
        // Section rhythm.
        "section-y": "7rem", // 112px desktop vertical band
        "section-y-sm": "4rem", // 64px mobile
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "20px",
      },
      boxShadow: {
        // Subtle, dark-native elevation (no soft consumer shadows).
        "elev-1": "0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02)",
        "elev-2": "0 4px 16px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.03)",
        "elev-3": "0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
        "accent-glow": "0 0 0 1px rgba(255,122,0,0.4), 0 0 24px rgba(255,122,0,0.18)",
        "focus-ring": "0 0 0 2px #0B0E13, 0 0 0 4px #FF7A00",
      },
      keyframes: {
        // "Instrumentation coming online" — short fade + rise.
        "online-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "online-in": "online-in 0.4s ease-out both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

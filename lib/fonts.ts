import { Inter, JetBrains_Mono } from "next/font/google";

/**
 * Inter — body/UI (precise technical sans).
 * JetBrains Mono — "technical proof" moments: formulas, citations, the demo.
 * Both self-hosted by next/font (no external request, no layout shift); exposed as
 * CSS variables consumed by tailwind.config.ts (`--font-sans`, `--font-mono`).
 */
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

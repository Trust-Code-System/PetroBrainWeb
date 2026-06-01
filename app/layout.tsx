import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontMono, fontSans } from "@/lib/fonts";
import { site } from "@/lib/site";
import { Plausible } from "@/components/analytics/Plausible";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B0E13",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
      <body className="min-h-dvh">
        {/* Chrome (nav/footer or app shell) lives in the route-group layouts:
            app/(marketing)/layout.tsx and app/app/layout.tsx. */}
        {children}
        <Plausible />
      </body>
    </html>
  );
}

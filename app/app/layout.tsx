import type { Metadata } from "next";
import { ThemeProvider, ThemeScript } from "@/components/app/ThemeProvider";
import { ChromeProvider } from "@/components/app/ChromeProvider";
import { Sidebar } from "@/components/app/Sidebar";
import { TopBar } from "@/components/app/TopBar";
import { CopilotBubble } from "@/components/app/CopilotBubble";

/**
 * App shell — the logged-in product's chrome (separate from the marketing Nav/Footer).
 * Left sidebar + sticky top bar + main content + the page-aware copilot bubble on every
 * page. The shell root (#app-shell) carries data-app-theme so the light/dark toggle is
 * scoped here only; ThemeScript applies the stored theme before paint (no flash).
 *
 * Route protection (unauthenticated → /login) is added in Task 2.
 */
export const metadata: Metadata = {
  title: { default: "App", template: "%s · PetroBrain" },
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ChromeProvider>
        {/* No data-app-theme here: CSS defaults to dark when absent, and ThemeScript
            (first child) applies the stored theme before paint — avoids a hydration
            attribute mismatch. */}
        <div id="app-shell" className="flex min-h-dvh bg-base">
          <ThemeScript />
          <a
            href="#app-main"
            className="sr-only-focusable absolute left-4 top-4 z-[100] rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast"
          >
            Skip to content
          </a>

          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main id="app-main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>

          <CopilotBubble />
        </div>
      </ChromeProvider>
    </ThemeProvider>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ThemeProvider, ThemeScript } from "@/components/app/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ChromeProvider } from "@/components/app/ChromeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { PageContextProvider } from "@/components/copilot/PageContextProvider";
import { AppActionProvider } from "@/components/copilot/AppActionProvider";
import { ActiveAssetProvider } from "@/components/app/ActiveAssetProvider";
import { Sidebar } from "@/components/app/Sidebar";
import { TopBar } from "@/components/app/TopBar";
import { CopilotBubble } from "@/components/app/CopilotBubble";
import { auth } from "@/lib/auth/server";
import type { User } from "@/lib/auth/types";

/**
 * App shell — the logged-in product's chrome (separate from the marketing Nav/Footer).
 * Left sidebar + sticky top bar + main content + the page-aware copilot bubble on every
 * page. The shell root (#app-shell) carries data-app-theme so the light/dark toggle is
 * scoped here only; ThemeScript applies the stored theme before paint (no flash).
 *
 * Route protection (unauthenticated → /login) is enforced in proxy.ts (Neon Auth
 * middleware); we re-read the session here to hydrate AuthProvider with the user. Tenant is
 * resolved backend-side from the Neon token, so it's blank here for now.
 */
export const metadata: Metadata = {
  title: { default: "App", template: "%s · PetroBrain" },
  robots: { index: false, follow: false },
};

// auth.getSession() reads cookies, so this layout must render dynamically.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/login");
  const u = session.user;
  const user: User = {
    id: u.id,
    email: u.email,
    name: u.name ?? undefined,
    role: (u as { role?: string }).role ?? "",
    tenantId: "",
  };

  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
        <AppActionProvider>
        <ChromeProvider>
          <AuthProvider initialUser={user}>
            <ActiveAssetProvider>
            <PageContextProvider>
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
            </PageContextProvider>
            </ActiveAssetProvider>
          </AuthProvider>
        </ChromeProvider>
        </AppActionProvider>
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

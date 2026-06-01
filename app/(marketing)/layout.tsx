import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

/**
 * Marketing chrome — the public front door. The persistent top Nav + Footer that
 * wrap every public page. The logged-in app (app/app/layout.tsx) has its own shell,
 * so this chrome never appears there. Always dark (no theme toggle here).
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only-focusable absolute left-4 top-4 z-[100] rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { getPageTitle } from "@/lib/appNav";
import { Badge } from "@/components/ui/Badge";

/**
 * PagePlaceholder — the temporary "Coming soon" body for app routes whose real
 * content ships in a later task. Derives its title from the current route so each
 * stub page is a one-liner. Deliberately framed as "being built", not a dead empty
 * state — consistent with the platform's "never show nothing useful" rule.
 */
export function PagePlaceholder() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <Badge tone="neutral" dot className="mb-4">
        Coming soon
      </Badge>
      <h2 className="text-2xl font-semibold tracking-tight text-primary">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-secondary">
        This section is being built. The navigation, theming, and copilot shell are
        live — the page&apos;s data and tools land in an upcoming task.
      </p>
      <p className="mt-4 font-mono text-xs text-faint">{pathname}</p>
    </div>
  );
}

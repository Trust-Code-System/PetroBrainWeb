import Script from "next/script";

/**
 * Privacy-respecting Plausible analytics — env-gated.
 * Renders nothing unless NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set, so dev/preview builds
 * stay clean and no third-party script loads without configuration.
 */
export function Plausible() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  const src =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";

  return (
    <Script
      defer
      data-domain={domain}
      src={src}
      strategy="afterInteractive"
    />
  );
}

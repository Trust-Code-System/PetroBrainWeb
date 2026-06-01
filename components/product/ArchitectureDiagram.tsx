/**
 * ArchitectureDiagram — custom SVG of the two-tier model (no clip art).
 * Top: cloud knowledge tier. A clear OT-firewall boundary. Bottom: on-prem
 * operational tier inside the customer's tenant. Colours are hard-coded from the
 * design tokens (SVG can't use Tailwind colour utilities); fonts inherit via the
 * `font-sans` class on <svg>. Accessible: role="img" + title/desc, with a visually
 * hidden structured description for screen readers.
 */
const C = {
  panel: "#11151C",
  box: "#171C25",
  box2: "#1E2632",
  border: "#323B4A",
  base: "#0B0E13",
  text: "#E6EAF0",
  sub: "#8B95A6",
  label: "#AEB7C5",
  accent: "#FF7A00",
};

export function ArchitectureDiagram() {
  return (
    <figure className="overflow-hidden rounded-xl border border-border-subtle bg-base p-3 sm:p-5">
      <svg
        viewBox="0 0 800 600"
        className="font-sans w-full"
        role="img"
        aria-labelledby="arch-title arch-desc"
      >
        <title id="arch-title">PetroBrain two-tier architecture</title>
        <desc id="arch-desc">
          A cloud knowledge tier containing the reasoning layer, general engineering knowledge,
          and public market data, separated by an OT firewall from an on-premises operational
          tier inside the customer&apos;s tenant. The operational tier holds the document RAG
          index, a read-only historian replica, the deterministic calculation engine, and
          operational data that never leaves. Only scoped context and cited answers cross the
          firewall; there is no control path back into OT.
        </desc>

        <defs>
          <marker id="arrow-up" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M5 0 L10 8 L0 8 Z" fill={C.accent} />
          </marker>
          <marker id="arrow-down" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 2 L10 2 L5 10 Z" fill={C.sub} />
          </marker>
        </defs>

        {/* ---------------- Cloud knowledge tier ---------------- */}
        <rect x="24" y="24" width="752" height="170" rx="14" fill={C.panel} stroke={C.border} />
        <text x="44" y="52" className="font-mono" fontSize="12" letterSpacing="1.5" fill={C.label}>
          CLOUD KNOWLEDGE TIER
        </text>
        <text x="756" y="52" textAnchor="end" className="font-mono" fontSize="11" fill={C.sub}>
          off-premises
        </text>

        {/* box 1 — reasoning layer */}
        <g>
          <rect x="44" y="72" width="226" height="104" rx="10" fill={C.box} stroke={C.accent} />
          <circle cx="64" cy="96" r="4" fill={C.accent} />
          <text x="78" y="100" fontSize="15" fontWeight="600" fill={C.text}>
            Reasoning layer
          </text>
          <text x="60" y="124" fontSize="12" fill={C.sub}>
            the LLM — reasons,
          </text>
          <text x="60" y="142" fontSize="12" fill={C.sub}>
            cites, and orchestrates.
          </text>
          <text x="60" y="160" fontSize="12" fill={C.accent}>
            Never does the math.
          </text>
        </g>

        {/* box 2 — engineering knowledge */}
        <g>
          <rect x="286" y="72" width="226" height="104" rx="10" fill={C.box} stroke={C.border} />
          <text x="302" y="100" fontSize="15" fontWeight="600" fill={C.text}>
            Engineering knowledge
          </text>
          <text x="302" y="124" fontSize="12" fill={C.sub}>
            standards, codes, and
          </text>
          <text x="302" y="142" fontSize="12" fill={C.sub}>
            domain expertise —
          </text>
          <text x="302" y="160" fontSize="12" fill={C.sub}>
            domain-locked.
          </text>
        </g>

        {/* box 3 — public data */}
        <g>
          <rect x="528" y="72" width="226" height="104" rx="10" fill={C.box} stroke={C.border} />
          <text x="544" y="100" fontSize="15" fontWeight="600" fill={C.text}>
            Public &amp; market data
          </text>
          <text x="544" y="124" fontSize="12" fill={C.sub}>
            EIA · OPEC · IEA ·
          </text>
          <text x="544" y="142" fontSize="12" fill={C.sub}>
            rig counts · satellite
          </text>
          <text x="544" y="160" fontSize="12" fill={C.sub}>
            methane.
          </text>
        </g>

        {/* ---------------- OT firewall ---------------- */}
        <line x1="24" y1="274" x2="776" y2="274" stroke={C.accent} strokeWidth="1.5" strokeDasharray="6 6" opacity="0.7" />
        <rect x="296" y="260" width="208" height="30" rx="15" fill={C.base} stroke={C.accent} />
        {/* lock glyph */}
        <g transform="translate(318 268)" stroke={C.accent} strokeWidth="1.4" fill="none">
          <rect x="0" y="6" width="14" height="9" rx="2" fill={C.accent} stroke="none" />
          <path d="M3 6 V4 a4 4 0 0 1 8 0 V6" />
        </g>
        <text x="404" y="280" textAnchor="middle" className="font-mono" fontSize="12" letterSpacing="1" fill={C.accent}>
          OT FIREWALL
        </text>

        {/* crossing conduit (between reasoning box and on-prem tier) */}
        <line x1="150" y1="320" x2="150" y2="178" stroke={C.accent} strokeWidth="1.6" markerEnd="url(#arrow-up)" />
        <line x1="190" y1="178" x2="190" y2="320" stroke={C.sub} strokeWidth="1.6" markerEnd="url(#arrow-down)" />
        <text x="214" y="238" fontSize="12" fill={C.label}>
          scoped context ↑
        </text>
        <text x="214" y="256" fontSize="12" fill={C.sub}>
          cited answers ↓
        </text>

        {/* ---------------- On-prem operational tier ---------------- */}
        <rect x="24" y="320" width="752" height="256" rx="14" fill={C.panel} stroke={C.border} />
        <text x="44" y="348" className="font-mono" fontSize="12" letterSpacing="1.5" fill={C.label}>
          ON-PREM OPERATIONAL TIER
        </text>
        <text x="756" y="348" textAnchor="end" className="font-mono" fontSize="11" fill={C.sub}>
          inside your tenant
        </text>

        {/* 2x2 grid */}
        {/* A — RAG */}
        <g>
          <rect x="44" y="364" width="348" height="92" rx="10" fill={C.box} stroke={C.border} />
          <text x="62" y="392" fontSize="15" fontWeight="600" fill={C.text}>
            Your documents → RAG index
          </text>
          <text x="62" y="416" fontSize="12" fill={C.sub}>
            SOPs · P&amp;IDs · well files · daily reports.
          </text>
          <text x="62" y="436" fontSize="12" fill={C.sub}>
            Answers are grounded in these.
          </text>
        </g>
        {/* B — historian */}
        <g>
          <rect x="408" y="364" width="348" height="92" rx="10" fill={C.box} stroke={C.border} />
          <text x="426" y="392" fontSize="15" fontWeight="600" fill={C.text}>
            Historian / SCADA
          </text>
          <text x="426" y="416" fontSize="12" fill={C.sub}>
            read-only replica. PetroBrain reads;
          </text>
          <text x="426" y="436" fontSize="12" fill={C.sub}>
            it never writes back to control.
          </text>
        </g>
        {/* C — calc engine */}
        <g>
          <rect x="44" y="468" width="348" height="92" rx="10" fill={C.box2} stroke={C.accent} />
          <circle cx="64" cy="492" r="4" fill={C.accent} />
          <text x="78" y="496" fontSize="15" fontWeight="600" fill={C.text}>
            Deterministic calculation engine
          </text>
          <text x="62" y="520" fontSize="12" fill={C.sub}>
            every number is computed here —
          </text>
          <text x="62" y="540" fontSize="12" fill={C.accent}>
            not generated by the model.
          </text>
        </g>
        {/* D — operational data */}
        <g>
          <rect x="408" y="468" width="348" height="92" rx="10" fill={C.box} stroke={C.border} />
          <text x="426" y="496" fontSize="15" fontWeight="600" fill={C.text}>
            Operational data
          </text>
          <text x="426" y="520" fontSize="12" fill={C.sub}>
            production, maintenance, incidents —
          </text>
          <text x="426" y="540" fontSize="12" fill={C.sub}>
            stays in your tenant. Never leaves.
          </text>
        </g>
      </svg>

      <figcaption className="mt-3 text-center text-xs text-faint">
        Only scoped context and cited answers cross the firewall — read-only, with no control
        path back into OT.
      </figcaption>
    </figure>
  );
}

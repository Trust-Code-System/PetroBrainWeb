"use client";

import { useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Logo — PetroBrain wordmark with the glossy 3D oil-drop mark (shared with the
 * PetroBrain product app). Links home unless `asLink={false}`.
 */
export function Logo({
  asLink = true,
  className,
}: {
  asLink?: boolean;
  className?: string;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="h-6 w-6 shrink-0" />
      <span className="text-base font-semibold tracking-tight text-primary">
        Petro<span className="text-accent">Brain</span>
      </span>
    </span>
  );

  if (!asLink) return content;
  return (
    <Link href="/" aria-label="PetroBrain — home" className="rounded-sm">
      {content}
    </Link>
  );
}

/**
 * LogoMark — the standalone drop mark. A stylized 3D oil drop built from layered
 * radial gradients (rim, body, sub-surface), a back-light refraction, a specular
 * crescent and a floor contact shadow, so it reads as a glossy physical object
 * rather than a flat icon. Gradient IDs are made unique per instance with useId so
 * multiple logos can render on one page without id collisions.
 */
export function LogoMark({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const body = `pb-body-${uid}`;
  const rim = `pb-rim-${uid}`;
  const inner = `pb-inner-${uid}`;
  const back = `pb-back-${uid}`;
  const spec = `pb-spec-${uid}`;
  const floor = `pb-floor-${uid}`;
  const clip = `pb-clip-${uid}`;
  const ishadow = `pb-ishadow-${uid}`;
  const drop = "M32 4 C32 4 11 27 11 41.5 a21 21 0 1 0 42 0 C53 27 32 4 32 4 Z";

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="PetroBrain" fill="none">
      <defs>
        {/* Outer rim — Fresnel falloff at the edges */}
        <radialGradient id={rim} cx="50%" cy="55%" r="55%">
          <stop offset="60%" stopColor="#f97316" stopOpacity="0" />
          <stop offset="86%" stopColor="#7c2d12" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#431407" stopOpacity="0.85" />
        </radialGradient>

        {/* Core body — warm orange volume */}
        <radialGradient id={body} cx="40%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#ffe2bf" />
          <stop offset="18%" stopColor="#ffbf80" />
          <stop offset="42%" stopColor="#f97316" />
          <stop offset="72%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </radialGradient>

        {/* Sub-surface caustic — translucency */}
        <radialGradient id={inner} cx="62%" cy="70%" r="40%">
          <stop offset="0%" stopColor="#ffd6a3" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#fb923c" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>

        {/* Back-light refraction near the base */}
        <radialGradient id={back} cx="50%" cy="92%" r="30%">
          <stop offset="0%" stopColor="#fff0d9" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff0d9" stopOpacity="0" />
        </radialGradient>

        {/* Specular crescent — bright up top-left */}
        <linearGradient id={spec} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Floor contact shadow */}
        <radialGradient id={floor} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#431407" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#431407" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#431407" stopOpacity="0" />
        </radialGradient>

        {/* Inner shadow — ambient occlusion at the rim */}
        <filter id={ishadow} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" />
          <feOffset dx="0" dy="1.6" result="off" />
          <feComposite in="off" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
          <feColorMatrix
            in="shadowDiff"
            type="matrix"
            values="0 0 0 0 0.26  0 0 0 0 0.08  0 0 0 0 0.03  0 0 0 0.55 0"
          />
          <feComposite in2="SourceGraphic" operator="in" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode />
          </feMerge>
        </filter>

        <clipPath id={clip}>
          <path d={drop} />
        </clipPath>
      </defs>

      {/* Floor contact shadow */}
      <ellipse cx="32" cy="60" rx="17" ry="2.6" fill={`url(#${floor})`} />

      {/* Body silhouette */}
      <path d={drop} fill={`url(#${body})`} filter={`url(#${ishadow})`} />

      {/* Inner lighting, clipped to the drop shape */}
      <g clipPath={`url(#${clip})`}>
        <ellipse cx="40" cy="46" rx="14" ry="10" fill={`url(#${inner})`} />
        <ellipse cx="32" cy="55" rx="14" ry="6" fill={`url(#${back})`} />
        <path d={drop} fill={`url(#${rim})`} />
        <path
          d="M24 12 C18 22 14.5 31 14.5 39 C14.5 43.5 16.5 46.5 19.5 47.5 C18.5 41 21 31.5 27 21 C28.5 18 26 11 24 12 Z"
          fill={`url(#${spec})`}
          opacity="0.9"
        />
        <ellipse cx="22.5" cy="22" rx="2.2" ry="3.6" fill="#ffffff" opacity="0.95" transform="rotate(-22 22.5 22)" />
        <ellipse cx="42" cy="50" rx="4.2" ry="2.4" fill="#ffffff" opacity="0.45" transform="rotate(-18 42 50)" />
      </g>
    </svg>
  );
}

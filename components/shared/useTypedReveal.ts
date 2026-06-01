import { useEffect, useState } from "react";

/**
 * Shared "instrumentation coming online" typing engine, used by the homepage hero
 * demo and the /intelligence cross-domain demo. Types out an intro string, then
 * reveals N structured blocks one-by-one. Honours prefers-reduced-motion (instant).
 */

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

type TypedRevealOptions = {
  intro: string;
  blockCount: number;
  /** Bump to (re)start the animation; 0 means "not started yet". */
  runToken: number;
  reduced: boolean;
  typeMs?: number;
  blockMs?: number;
};

export function useTypedReveal({
  intro,
  blockCount,
  runToken,
  reduced,
  typeMs = 14,
  blockMs = 260,
}: TypedRevealOptions): { introLen: number; blocks: number; typingDone: boolean } {
  const [introLen, setIntroLen] = useState(0);
  const [blocks, setBlocks] = useState(0);

  useEffect(() => {
    if (runToken === 0) return; // not started

    if (reduced) {
      setIntroLen(intro.length);
      setBlocks(blockCount);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setIntroLen(0);
    setBlocks(0);

    let i = 0;
    const typeIntro = () => {
      if (cancelled) return;
      i += 1;
      setIntroLen(i);
      if (i < intro.length) {
        timers.push(setTimeout(typeIntro, typeMs));
        return;
      }
      let b = 0;
      const revealBlock = () => {
        if (cancelled) return;
        b += 1;
        setBlocks(b);
        if (b < blockCount) timers.push(setTimeout(revealBlock, blockMs));
      };
      timers.push(setTimeout(revealBlock, blockMs));
    };
    timers.push(setTimeout(typeIntro, typeMs));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [intro, blockCount, runToken, reduced, typeMs, blockMs]);

  return { introLen, blocks, typingDone: introLen >= intro.length };
}

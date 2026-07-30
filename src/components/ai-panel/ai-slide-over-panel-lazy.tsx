"use client";

import dynamic from "next/dynamic";

const AiSlideOverPanel = dynamic(
  () =>
    import("@/components/ai-panel/ai-slide-over-panel").then(
      (mod) => mod.AiSlideOverPanel,
    ),
  { ssr: false },
);

/** Client boundary so `dynamic(..., { ssr: false })` is valid from server layouts. */
export function AiSlideOverPanelLazy() {
  return <AiSlideOverPanel />;
}

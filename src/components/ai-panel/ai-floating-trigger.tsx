"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAiPanel } from "./ai-panel-context";
import { usePharmacyEntitlements } from "@/hooks/usePharmacyEntitlements";
import { cn } from "@/lib/utils";

const AI_PAGE_PATHS = ["/pharmacy/ai", "/admin/ai"];

export function AiFloatingTrigger() {
  const { isOpen, openPanel, setUpgradeDialogOpen } = useAiPanel();
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const { can, isHydrating, isEntitlementsReady } = usePharmacyEntitlements({
    enabled: !isAdminRoute,
  });
  const [hovered, setHovered] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isOpen || AI_PAGE_PATHS.includes(pathname) || dismissed) return null;

  const handleClick = () => {
    if (isAdminRoute) {
      openPanel();
      return;
    }
    if (isHydrating || !isEntitlementsReady) return;
    if (!can("ai.chat")) {
      setUpgradeDialogOpen(true);
      return;
    }
    openPanel();
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Close button — appears on hover at top-right corner */}
      <button
        type="button"
        aria-label="Dismiss AI assistant"
        onClick={(e) => {
          e.stopPropagation();
          setDismissed(true);
        }}
        className={cn(
          "absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full",
          "bg-neutral-800 dark:bg-neutral-600 text-white shadow-md",
          "transition-all duration-150",
          hovered
            ? "opacity-100 scale-100"
            : "opacity-0 scale-75 pointer-events-none",
        )}
      >
        <X className="h-3 w-3" strokeWidth={2.5} />
      </button>

      {/* Main pill button */}
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 rounded-full border px-4 py-2.5",
          "bg-white/90 shadow-lg backdrop-blur-sm transition-shadow hover:shadow-xl",
          "dark:border-neutral-700 dark:bg-neutral-900/90",
        )}
      >
        <Sparkles className="size-4 text-amber-500" />
        <span className="text-sm text-neutral-600 dark:text-neutral-300">
          Ask a question...
        </span>
      </button>
    </div>
  );
}

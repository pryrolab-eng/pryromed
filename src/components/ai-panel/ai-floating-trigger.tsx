"use client";

import { Sparkles } from "lucide-react";
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

  if (isOpen || AI_PAGE_PATHS.includes(pathname)) return null;

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
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
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

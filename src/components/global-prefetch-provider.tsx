"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  pharmacyDashboardKeys,
  getCombinedDashboardData,
} from "@/lib/http/pharmacy-dashboard";
import { useBranchReportScope } from "@/hooks/useBranchReportScope";
import { usePathname } from "next/navigation";

const PREFETCH_STALE_MS = 10 * 60 * 1000;

export function GlobalPrefetchProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { scopeQuery, days } = useBranchReportScope();
  const pathname = usePathname();

  useEffect(() => {
    const onDashboardRoute = pathname?.startsWith("/pharmacy/dashboard");
    if (!onDashboardRoute) return;

    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection as { saveData?: boolean; effectiveType?: string } | undefined;
    if (connection?.saveData) return;
    if (connection?.effectiveType && /2g/.test(connection.effectiveType)) return;

    const prefetchDashboard = async () => {
      await queryClient.prefetchQuery({
        queryKey: pharmacyDashboardKeys.combined(scopeQuery?.branchId, days),
        queryFn: () =>
          getCombinedDashboardData({
            ...scopeQuery,
            branchId: scopeQuery?.branchId,
          }),
        staleTime: PREFETCH_STALE_MS,
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(
        () => {
          void prefetchDashboard();
        },
        { timeout: 5000 },
      );
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(() => {
      void prefetchDashboard();
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [queryClient, scopeQuery, days, pathname]);

  return <>{children}</>;
}

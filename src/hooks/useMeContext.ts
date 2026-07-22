"use client";

import { useQuery } from "@tanstack/react-query";
import { getMeContext, meContextKeys } from "@/lib/http/me-context";

export { meContextKeys } from "@/lib/http/me-context";
export type { MeContextResponse } from "@/lib/http/me-context";

/**
 * Current user session context — role, active pharmacy/branch, permissions.
 * Cached for 5 min; shared across all consumers in the same React tree.
 */
export function useMeContext(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: meContextKeys.all,
    queryFn: getMeContext,
    staleTime: 5 * 60_000,
    enabled: options?.enabled ?? true,
  });
}

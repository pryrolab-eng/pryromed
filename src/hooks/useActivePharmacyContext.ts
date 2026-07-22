"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  getMeContext,
  meContextKeys,
  setActiveBranch,
  setActivePharmacy,
  type MeContextResponse,
} from "@/lib/http/me-context";
import { pharmacyDashboardKeys } from "@/lib/http/pharmacy-dashboard";
import { inventoryKeys } from "@/lib/http/inventory";
import { salesKeys } from "@/lib/http/sales";
import { reportsKeys } from "@/lib/http/reports";
import { posKeys } from "@/lib/http/pos";
import { customersKeys } from "@/lib/http/customers";
import { pharmacistDashboardKeys } from "@/lib/http/pharmacist-dashboard";
import { realtimeKeys } from "@/lib/http/realtime";
import { ApiError } from "@/lib/http/client";

const EMPTY: MeContextResponse = {
  user: { id: "", email: null, fullName: null, isPlatformAdmin: false },
  activePharmacyId: null,
  activeBranchId: null,
  role: null,
  allowedBranchIds: null,
  permissions: [],
  mustChangePassword: false,
  memberships: [],
};

/** Branch-scoped operational/analytics caches — not entitlements, auth, plans, etc. */
const BRANCH_SCOPED_QUERY_ROOTS = [
  pharmacyDashboardKeys.all,
  inventoryKeys.all,
  salesKeys.all,
  reportsKeys.all,
  posKeys.all,
  customersKeys.all,
  pharmacistDashboardKeys.all,
  realtimeKeys.all,
] as const;

export function useActivePharmacyContext(options?: { enabled?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: meContextKeys.all,
    queryFn: getMeContext,
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: (attempt) => Math.min(400 * (attempt + 1), 1200),
  });

  const hasSnapshot = query.data !== undefined;
  const isHydrating = !hasSnapshot && !query.isError;

  const data = query.data ?? EMPTY;

  const branchRepairAttempted = useRef(false);

  /** Server auto-creates a default branch; refetch session once if still missing. */
  useEffect(() => {
    if (branchRepairAttempted.current || isHydrating) return;
    if (data.activePharmacyId && !data.activeBranchId) {
      branchRepairAttempted.current = true;
      void query.refetch();
    }
  }, [data.activePharmacyId, data.activeBranchId, isHydrating, query.refetch]);

  const invalidateBranchScopedQueries = async () => {
    await Promise.all(
      BRANCH_SCOPED_QUERY_ROOTS.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );
  };

  const switchPharmacy = async (pharmacyId: string) => {
    await setActivePharmacy(pharmacyId);
    // Pharmacy change affects almost everything — full reset is appropriate.
    await queryClient.invalidateQueries();
    router.refresh();
  };

  const switchBranch = async (branchId: string) => {
    if (branchId === data.activeBranchId) return;

    // ── Optimistic update — UI responds instantly ──────────────────────────
    // Update the session cache immediately so the header, POS, and all branch-
    // scoped components reflect the new branch before the API call completes.
    const previous = queryClient.getQueryData<MeContextResponse>(meContextKeys.all);
    queryClient.setQueryData<MeContextResponse>(meContextKeys.all, (prev) =>
      prev ? { ...prev, activeBranchId: branchId } : prev,
    );

    try {
      const result = await setActiveBranch(branchId);
      const confirmedBranchId = result.activeBranchId ?? branchId;

      // Reconcile — server may have corrected the branch ID
      if (confirmedBranchId !== branchId) {
        queryClient.setQueryData<MeContextResponse>(meContextKeys.all, (prev) =>
          prev
            ? {
                ...prev,
                activeBranchId: confirmedBranchId,
                activePharmacyId:
                  result.activePharmacyId ?? prev.activePharmacyId,
              }
            : prev,
        );
      }
    } catch {
      // Rollback on failure
      queryClient.setQueryData(meContextKeys.all, previous);
      return;
    }

    // Kick off background refetches — fire and forget, no need to await
    void invalidateBranchScopedQueries();
    // Intentionally no router.refresh() — client queries own branch data.
  };

  return {
    ...query,
    context: data,
    hasSnapshot,
    isHydrating,
    activePharmacyId: data.activePharmacyId,
    activeBranchId: data.activeBranchId,
    allowedBranchIds: data.allowedBranchIds ?? null,
    permissions: data.permissions ?? [],
    memberships: data.memberships,
    switchPharmacy,
    switchBranch,
  };
}

"use client";

import {
  deleteStaffMember,
  getStaffUsers,
  resendStaffInvite,
  staffUsersQueryKey,
  updateStaffMember,
  type StaffUpdatePayload,
} from "@/lib/http/staff";
import {
  getStaffBranchAccess,
  updateStaffBranchAccess,
} from "@/lib/http/staff-branches";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SEARCH_LIST_STALE_MS } from "@/lib/search/constants";

export type { StaffUser, StaffUpdatePayload } from "@/lib/http/staff";
export { staffUsersQueryKey } from "@/lib/http/staff";

/**
 * Pharmacy staff for the current tenant (backed by `GET /api/staff`).
 * Superadmin / cross-tenant user lists can be a separate hook + route later.
 */
export function useUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: staffUsersQueryKey,
    queryFn: getStaffUsers,
    enabled: options?.enabled ?? true,
    staleTime: SEARCH_LIST_STALE_MS,
  });
}

export function useUpdateStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: StaffUpdatePayload }) =>
      updateStaffMember(id, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: staffUsersQueryKey }),
  });
}

export function useDeleteStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStaffMember,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: staffUsersQueryKey }),
  });
}

export function useResendStaffInviteMutation() {
  return useMutation({
    mutationFn: resendStaffInvite,
  });
}

// ── Branch access ──────────────────────────────────────────────────────────

export const staffBranchAccessQueryKey = (pharmacyUserId: string) =>
  ["staff", "branches", pharmacyUserId] as const;

/**
 * Fetch branch access for one staff member.
 * Cached for 5 min — no spinner every time the sheet opens.
 */
export function useStaffBranchAccess(pharmacyUserId: string | null) {
  return useQuery({
    queryKey: staffBranchAccessQueryKey(pharmacyUserId ?? ""),
    queryFn: () => getStaffBranchAccess(pharmacyUserId!),
    enabled: !!pharmacyUserId,
    staleTime: SEARCH_LIST_STALE_MS,
  });
}

export function useUpdateStaffBranchAccessMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pharmacyUserId,
      branchIds,
    }: {
      pharmacyUserId: string;
      branchIds: string[];
    }) => updateStaffBranchAccess(pharmacyUserId, branchIds),
    onSuccess: (data, { pharmacyUserId }) => {
      // Write the fresh result straight into the cache — no extra network call
      queryClient.setQueryData(staffBranchAccessQueryKey(pharmacyUserId), data);
    },
  });
}

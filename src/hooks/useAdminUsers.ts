"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListQueryDefaults } from "@/lib/query/admin-query-options";
import {
  adminUsersWithoutPharmacyQueryKey,
  deleteAdminAuthUser,
  getAdminUsersWithoutPharmacy,
} from "@/lib/http/admin/users";

export { adminUsersWithoutPharmacyQueryKey } from "@/lib/http/admin/users";

export function useAdminUsersWithoutPharmacy(options?: {
  q?: string;
  enabled?: boolean;
}) {
  return useQuery({
    ...adminListQueryDefaults,
    queryKey: [...adminUsersWithoutPharmacyQueryKey, options?.q ?? ""],
    queryFn: () =>
      getAdminUsersWithoutPharmacy({ q: options?.q, limit: 500 }),
    enabled: options?.enabled ?? true,
  });
}

export function useDeleteAdminAuthUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteAdminAuthUser(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminUsersWithoutPharmacyQueryKey,
      });
    },
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminMaintenanceKeys,
  getMaintenanceQueueStats,
  notifyMaintenanceUsers,
} from "@/lib/http/admin/maintenance";

export { adminMaintenanceKeys } from "@/lib/http/admin/maintenance";
export type { QueueStats } from "@/lib/http/admin/maintenance";

/**
 * Polls every 5 s when the maintenance panel is open.
 * Falls back to stale data between polls — no spinner flash.
 */
export function useMaintenanceQueueStats() {
  return useQuery({
    queryKey: adminMaintenanceKeys.queueStats,
    queryFn: getMaintenanceQueueStats,
    staleTime: 4_000,          // treat data as fresh for 4 s
    refetchInterval: 5_000,    // background refetch every 5 s
    refetchIntervalInBackground: false,
  });
}

export function useNotifyMaintenanceUsersMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { message: string; scheduledAt: string }) =>
      notifyMaintenanceUsers(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminMaintenanceKeys.queueStats });
    },
  });
}

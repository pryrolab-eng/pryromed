import { fetchJson } from "../client";

export const adminMaintenanceKeys = {
  queueStats: ["admin", "maintenance", "queue-stats"] as const,
};

export type QueueStats = {
  configured: boolean;
  stats: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  } | null;
  recentBatches: Array<{
    batchId: string;
    sent: number;
    failed: number;
    total: number;
    createdAt: string;
  }>;
};

export async function getMaintenanceQueueStats(): Promise<QueueStats> {
  return fetchJson<QueueStats>("/api/admin/maintenance/notify");
}

export async function notifyMaintenanceUsers(body: {
  message: string;
  scheduledAt: string;
}): Promise<{ queued: number }> {
  return fetchJson<{ queued: number }>("/api/admin/maintenance/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

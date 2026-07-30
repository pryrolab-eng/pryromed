import { fetchJson } from "./client";

export const realtimeKeys = {
  all: ["realtime"] as const,
  updates: () => [...realtimeKeys.all, "updates"] as const,
};

export type RealtimeUpdate = {
  type:
    | "inventory_update"
    | "new_sale"
    | "stock_alert"
    | "prescription_update"
    | string;
  data: unknown;
};

type RealtimeUpdatesEnvelope = {
  updates?: RealtimeUpdate[];
};

export async function getRealtimeUpdates(): Promise<RealtimeUpdate[]> {
  const data = await fetchJson<RealtimeUpdate[] | RealtimeUpdatesEnvelope>(
    "/api/realtime/updates",
  );
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.updates) ? data.updates : [];
}

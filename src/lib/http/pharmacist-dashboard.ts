import { ensureApiSuccess, fetchJson } from "./client";
import { getStockAlerts, type StockAlertsResponse } from "./pharmacy-dashboard";

export type PharmacistStats = {
  prescriptionsToday: number;
  customersServed: number;
  averageWaitTime: number;
  completedSales: number;
  pendingPrescriptions: number;
  consultationsGiven: number;
  inventoryChecks: number;
  alertsHandled: number;
};

export type PharmacistActivity = {
  id: string;
  type: "sale" | "consultation" | "prescription" | "inventory";
  description: string;
  time: string;
  status: "completed" | "pending";
};

export type PharmacistChartPoint = {
  time: string;
  sales: number;
  prescriptions: number;
};

export type PendingPrescription = {
  id: string;
  patient: string;
  doctor: string;
  medications: string[];
  priority: "high" | "medium" | "low" | string;
  time: string;
  insurance: string;
};

export const pharmacistDashboardKeys = {
  all: ["pharmacist", "dashboard"] as const,
  stats: () => [...pharmacistDashboardKeys.all, "stats"] as const,
  activities: () => [...pharmacistDashboardKeys.all, "activities"] as const,
  chartData: () => [...pharmacistDashboardKeys.all, "chart-data"] as const,
  prescriptions: () => [...pharmacistDashboardKeys.all, "prescriptions"] as const,
  stockAlerts: () => [...pharmacistDashboardKeys.all, "stock-alerts"] as const,
};

export async function getPharmacistDashboardStats(): Promise<PharmacistStats> {
  return fetchJson<PharmacistStats>("/api/pharmacist/dashboard");
}

export async function getPharmacistActivities(): Promise<PharmacistActivity[]> {
  const data = await fetchJson<PharmacistActivity[]>(
    "/api/pharmacist/activities",
  );
  return Array.isArray(data) ? data : [];
}

export async function getPharmacistChartData(): Promise<PharmacistChartPoint[]> {
  const data = await fetchJson<PharmacistChartPoint[]>(
    "/api/pharmacist/chart-data",
  );
  return Array.isArray(data) ? data : [];
}

export async function getPharmacistPrescriptions(): Promise<
  PendingPrescription[]
> {
  const data = await fetchJson<PendingPrescription[]>(
    "/api/pharmacist/prescriptions",
  );
  return Array.isArray(data) ? data : [];
}

export async function getPharmacistStockAlerts(): Promise<StockAlertsResponse> {
  return getStockAlerts();
}

export async function trackPharmacistActivity(
  type: string,
  data: Record<string, unknown>,
): Promise<void> {
  await fetchJson("/api/pharmacist/track-activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, data }),
  });
}

export async function processPharmacistPrescription(payload: {
  prescriptionId: string;
  action: string;
}): Promise<{ success: boolean }> {
  const result = await fetchJson<{ success: boolean }>(
    "/api/pharmacist/prescriptions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  ensureApiSuccess(result, "Failed to process prescription");
  return result;
}

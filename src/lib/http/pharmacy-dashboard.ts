import { fetchJson } from "./client";
import {
  buildBranchScopeQueryString,
  branchScopeCacheKey,
  type BranchScopeQuery,
} from "@/lib/pharmacy/branch-scope";

export type PharmacyDashboardStats = {
  totalProducts: number;
  lowStockItems: number;
  todaySales: number;
  monthlyRevenue: number;
  totalCustomers: number;
  activeStaff: number;
  pendingOrders: number;
  expiringProducts: number;
};

export type RecentSaleRow = {
  id: string;
  customer: string;
  amount: number;
  items: number;
  time: string;
  payment_method: string;
};

export type StockAlertRow = {
  id: string;
  product: string;
  current_stock: number;
  min_stock: number;
  category: string;
  expires_in: number;
};

export type StockAlertsResponse = {
  all: StockAlertRow[];
  lowStock: StockAlertRow[];
  expiring: StockAlertRow[];
};

export type SalesChartPoint = {
  month: string;
  revenue: number;
};

export type WeeklySalesChartPoint = {
  day: string;
  prescription: number;
  otc: number;
};

export type CategorySalesChartPoint = {
  category: string;
  sales: number;
  fill: string;
};

export type InventoryChartPoint = {
  month: string;
  inStock: number;
  lowStock: number;
};

export const pharmacyDashboardKeys = {
  all: ["pharmacy", "dashboard"] as const,
  stats: (branchId?: string, days = 30) =>
    [
      ...pharmacyDashboardKeys.all,
      "stats",
      ...branchScopeCacheKey(branchId, days),
    ] as const,
  recentSales: (branchId?: string, days = 30) =>
    [
      ...pharmacyDashboardKeys.all,
      "recent-sales",
      ...branchScopeCacheKey(branchId, days),
    ] as const,
  stockAlerts: (branchId?: string | null) => [...pharmacyDashboardKeys.all, "stock-alerts", branchId ?? "all"] as const,
  salesChart: () => [...pharmacyDashboardKeys.all, "sales-chart"] as const,
  weeklySales: () => [...pharmacyDashboardKeys.all, "weekly-sales"] as const,
  categorySales: () => [...pharmacyDashboardKeys.all, "category-sales"] as const,
  inventoryChart: () => [...pharmacyDashboardKeys.all, "inventory-chart"] as const,
  combined: (branchId?: string, days = 30) =>
    [
      ...pharmacyDashboardKeys.all,
      "combined",
      ...branchScopeCacheKey(branchId, days),
    ] as const,
};

export async function getPharmacyDashboardStats(
  scope?: BranchScopeQuery,
): Promise<PharmacyDashboardStats> {
  return fetchJson<PharmacyDashboardStats>(
    `/api/pharmacy/dashboard${buildBranchScopeQueryString(scope ?? {})}`,
  );
}

export async function getRecentPosSales(
  scope?: BranchScopeQuery,
): Promise<RecentSaleRow[]> {
  const data = await fetchJson<RecentSaleRow[]>(
    `/api/pos${buildBranchScopeQueryString(scope ?? {})}`,
  );
  return Array.isArray(data) ? data : [];
}

export async function getStockAlerts(branchId?: string | null): Promise<StockAlertsResponse> {
  const params = new URLSearchParams();
  if (branchId && branchId !== "all") {
    params.set("branchId", branchId);
  }
  const url = params.toString() ? `/api/stock-alerts?${params}` : "/api/stock-alerts";
  return fetchJson<StockAlertsResponse>(url);
}

export async function getPharmacySalesChart(): Promise<SalesChartPoint[]> {
  const data = await fetchJson<SalesChartPoint[]>("/api/pharmacy/sales-chart");
  return Array.isArray(data) ? data : [];
}

export async function getPharmacyWeeklySalesChart(): Promise<WeeklySalesChartPoint[]> {
  const data = await fetchJson<WeeklySalesChartPoint[]>(
    "/api/pharmacy/weekly-sales",
  );
  return Array.isArray(data) ? data : [];
}

export async function getPharmacyCategorySalesChart(): Promise<
  CategorySalesChartPoint[]
> {
  const data = await fetchJson<CategorySalesChartPoint[]>(
    "/api/pharmacy/category-sales",
  );
  return Array.isArray(data) ? data : [];
}

export async function getPharmacyInventoryChart(): Promise<InventoryChartPoint[]> {
  const data = await fetchJson<InventoryChartPoint[]>(
    "/api/pharmacy/inventory-chart",
  );
  return Array.isArray(data) ? data : [];
}

export type CombinedDashboardData = {
  stats: PharmacyDashboardStats;
  recentSales: RecentSaleRow[];
  stockAlerts: StockAlertsResponse;
  salesChart: SalesChartPoint[];
  weeklySales: WeeklySalesChartPoint[];
  categorySales: CategorySalesChartPoint[];
  inventoryChart: InventoryChartPoint[];
};

export async function getCombinedDashboardData(
  scope?: BranchScopeQuery,
): Promise<CombinedDashboardData> {
  return fetchJson<CombinedDashboardData>(
    `/api/pharmacy/dashboard/combined${buildBranchScopeQueryString(scope ?? {})}`,
  );
}

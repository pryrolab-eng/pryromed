import { fetchJson } from "./client";
import {
  buildSalesListQueryString,
  type SalesListPeriod,
} from "@/lib/sales/list-query";

export type SalesListParams = {
  period?: SalesListPeriod;
  q?: string;
  from?: string;
  to?: string;
  limit?: number;
  page?: number;
};

export const salesKeys = {
  all: ["sales"] as const,
  list: (params?: SalesListParams) =>
    [...salesKeys.all, "list", params ?? {}] as const,
  analytics: () => [...salesKeys.all, "analytics"] as const,
  combined: () => [...salesKeys.all, "combined"] as const,
};

export type CombinedSalesData = {
  salesReport: { totalSales: number; totalRevenue: number; topProducts: unknown[] };
  salesChart: unknown[];
  weeklySales: unknown[];
  categorySales: unknown[];
};

export async function getCombinedSalesData(): Promise<CombinedSalesData> {
  return fetchJson<CombinedSalesData>("/api/sales/combined");
}

export type SaleRow = {
  id: string;
  customer: string;
  amount: number;
  items: number;
  date: string;
  paymentMethod: string;
  status: string;
};

export type SalesListResponse = {
  sales: SaleRow[];
  stats: {
    todayTotal: number;
    weekTotal: number;
    monthTotal: number;
    totalSales: number;
  };
  total?: number;
  page?: number;
  limit?: number;
};

export type SalesAnalytics = {
  weeklySales: Array<{ day?: string; sales: number }>;
  paymentBreakdown: Array<{ method: string; percentage: number }>;
  hourlySales: Array<{ hour?: string; sales: number }>;
  monthlyComparison: Array<{ week?: string; current: number; previous: number }>;
  customerDistribution: Array<{ name: string; value: number; fill?: string }>;
  topCategories: Array<{ name: string; value: number; color: string }>;
};

export async function getSalesList(
  params?: SalesListParams,
): Promise<SalesListResponse> {
  return fetchJson<SalesListResponse>(
    `/api/sales${buildSalesListQueryString(params ?? {})}`,
  );
}

export async function getSalesAnalytics(): Promise<SalesAnalytics> {
  return fetchJson<SalesAnalytics>("/api/sales/analytics");
}

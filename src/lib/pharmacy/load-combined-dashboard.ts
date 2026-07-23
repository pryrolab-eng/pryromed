import { defaultReportRange } from "@/lib/pharmacy/branch-scope";
import { getCombinedDashboardData } from "@/lib/http/pharmacy-dashboard";
import { cacheGet, cacheSet } from "@/lib/cache/redis-cache";
import type {
  CombinedDashboardData,
} from "@/lib/http/pharmacy-dashboard";

const REDIS_TTL = 300; // 5 minutes

function dashboardCacheKey(
  pharmacyId: string,
  branchId: string | undefined,
  range: { from: string; to: string },
): string {
  const rangeKey = `${range.from.slice(0, 10)}_${range.to.slice(0, 10)}`;
  return `dashboard:${pharmacyId}:${branchId ?? "all"}:${rangeKey}`;
}

export async function loadCombinedDashboardData(
  _pharmacyId: string,
  branchId?: string,
  range: { from: string; to: string } = defaultReportRange(30),
): Promise<CombinedDashboardData> {
  const cacheKey = dashboardCacheKey(_pharmacyId, branchId, range);

  try {
    const cached = await cacheGet(cacheKey);
    if (cached && typeof cached === "object") {
      return cached as CombinedDashboardData;
    }
  } catch {
    // Redis optional — fall through to HTTP
  }

  const data = await getCombinedDashboardData({ branchId, from: range.from, to: range.to });

  try {
    await cacheSet(cacheKey, data, REDIS_TTL);
  } catch {
    // ignore cache write failures
  }

  return data;
}

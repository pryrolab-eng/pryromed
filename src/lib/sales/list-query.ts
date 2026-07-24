export type SalesListPeriod = "today" | "week" | "month" | "all";

export type SalesListQuery = {
  period: SalesListPeriod;
  q?: string;
  from?: string;
  to?: string;
  limit: number;
  page: number;
};

const PAYMENT_METHODS = [
  "cash",
  "card",
  "mobile_money",
  "insurance",
  "mixed",
] as const;

export function parseSalesListQuery(searchParams: URLSearchParams): SalesListQuery {
  const periodParam = searchParams.get("period");
  const period: SalesListPeriod =
    periodParam === "today" ||
    periodParam === "week" ||
    periodParam === "month" ||
    periodParam === "all"
      ? periodParam
      : "all";

  const q = searchParams.get("q")?.trim() || undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const limitRaw = Number(searchParams.get("limit") ?? "100");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.floor(limitRaw), 1), 200)
    : 100;
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  return { period, q, from, to, limit, page };
}

export function salesListDateRange(query: SalesListQuery): {
  from?: Date;
  to?: Date;
} {
  if (query.from && query.to) {
    return { from: new Date(query.from), to: new Date(query.to) };
  }

  const to = new Date();
  if (query.period === "all") {
    return { to };
  }

  const from = new Date();
  if (query.period === "today") {
    from.setHours(0, 0, 0, 0);
  } else if (query.period === "week") {
    from.setTime(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (query.period === "month") {
    from.setTime(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  return { from, to };
}

export function paymentMethodsMatchingQuery(q: string): string[] {
  const lower = q.toLowerCase();
  return PAYMENT_METHODS.filter((method) => method.includes(lower));
}

export function buildSalesListQueryString(input: {
  period?: SalesListPeriod;
  q?: string;
  from?: string;
  to?: string;
  limit?: number;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (input.period && input.period !== "all") {
    params.set("period", input.period);
  }
  if (input.q?.trim()) {
    params.set("q", input.q.trim());
  }
  if (input.from) params.set("from", input.from);
  if (input.to) params.set("to", input.to);
  if (input.limit) params.set("limit", String(input.limit));
  if (input.page) params.set("page", String(input.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

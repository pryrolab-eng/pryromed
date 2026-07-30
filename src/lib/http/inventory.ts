import { ensureApiSuccess, fetchJson } from "./client";

export type InventoryListRow = {
  id: string;
  medicationId?: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  expiryDate: string;
  batchNumber: string;
  stockLocationId?: string | null;
  stockLocationName?: string | null;
  pharmacy_id?: string;
  medications?: unknown;
};

export type InventoryAnalytics = {
  stockByCategory: Array<{ category: string; stock: number; value: number }>;
  inventoryTrend: Array<{ month: string; stock: number }>;
};

export type InventorySupplier = {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
};

export type ApiSuccessResult = {
  success: boolean;
  error?: string;
  newStock?: number;
  medicationId?: string;
};

export type AddInventoryProductInput = {
  name: string;
  category: string;
  batch_number: string;
  quantity: number;
  unit_cost: number;
  selling_price: number;
  minimum_stock_level: number;
  expiry_date: string;
  stockLocation?: string;
};

export type UpdateInventoryProductInput = {
  quantity: number;
  selling_price: number;
  minimum_stock_level: number;
};

export type PaginatedInventoryList = {
  rows: InventoryListRow[];
  total: number;
  page: number;
  limit: number;
};

export const inventoryKeys = {
  all: ["inventory"] as const,
  list: (
    branchId?: string | null,
    page?: number,
    limit?: number,
    q?: string,
    category?: string,
  ) =>
    [
      ...inventoryKeys.all,
      "list",
      branchId ?? "all",
      page ?? 1,
      limit ?? 50,
      q ?? "",
      category ?? "all",
    ] as const,
  analytics: (branchId?: string | null) => [...inventoryKeys.all, "analytics", branchId ?? "all"] as const,
  suppliers: () => [...inventoryKeys.all, "suppliers"] as const,
  combined: (
    branchId?: string | null,
    page?: number,
    limit?: number,
    q?: string,
    category?: string,
  ) =>
    [
      ...inventoryKeys.all,
      "combined",
      branchId ?? "all",
      page ?? 1,
      limit ?? 50,
      q ?? "",
      category ?? "all",
    ] as const,
};

export type CombinedInventoryData = {
  inventory: PaginatedInventoryList;
  stockAlerts: { all: unknown[]; lowStock: unknown[]; expiring: unknown[] };
  expiryAlerts: unknown[];
};

function normalizeCombinedInventory(data: unknown): CombinedInventoryData {
  const raw = (data ?? {}) as {
    inventory?: PaginatedInventoryList | InventoryListRow[];
    stockAlerts?: CombinedInventoryData["stockAlerts"];
    expiryAlerts?: unknown[];
  };
  const inventory = Array.isArray(raw.inventory)
    ? {
        rows: raw.inventory,
        total: raw.inventory.length,
        page: 1,
        limit: raw.inventory.length || 50,
      }
    : {
        rows: Array.isArray(raw.inventory?.rows) ? raw.inventory.rows : [],
        total: Number(raw.inventory?.total ?? 0),
        page: Number(raw.inventory?.page ?? 1),
        limit: Number(raw.inventory?.limit ?? 50),
      };
  return {
    inventory,
    stockAlerts: raw.stockAlerts ?? { all: [], lowStock: [], expiring: [] },
    expiryAlerts: Array.isArray(raw.expiryAlerts) ? raw.expiryAlerts : [],
  };
}

export async function getCombinedInventoryData(
  branchId?: string | null,
  page = 1,
  limit = 50,
  filters?: { q?: string; category?: string },
): Promise<CombinedInventoryData> {
  const params = new URLSearchParams();
  if (branchId && branchId !== "all") params.set("branchId", branchId);
  params.set("page", String(page));
  params.set("limit", String(limit));
  const q = filters?.q?.trim();
  if (q) params.set("q", q);
  const category = filters?.category?.trim();
  if (category && category !== "all") params.set("category", category);
  const data = await fetchJson<unknown>(
    `/api/inventory/combined?${params.toString()}`,
  );
  return normalizeCombinedInventory(data);
}

export async function getInventoryList(
  branchId?: string | null,
  page?: number,
  limit?: number,
  filters?: { q?: string; category?: string },
): Promise<PaginatedInventoryList> {
  const params = new URLSearchParams();
  if (branchId && branchId !== "all") {
    params.set("branchId", branchId);
  }
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  const q = filters?.q?.trim();
  if (q) params.set("q", q);
  const category = filters?.category?.trim();
  if (category && category !== "all") params.set("category", category);
  const url = params.toString() ? `/api/inventory?${params}` : "/api/inventory";
  return fetchJson<PaginatedInventoryList>(url);
}

export async function getInventoryAnalytics(): Promise<InventoryAnalytics> {
  return fetchJson<InventoryAnalytics>("/api/inventory/analytics");
}

export async function getInventorySuppliers(): Promise<InventorySupplier[]> {
  const data = await fetchJson<InventorySupplier[]>("/api/inventory/suppliers");
  return Array.isArray(data) ? data : [];
}

export async function createInventorySupplier(body: {
  name: string;
  contact: string;
  phone: string;
  email: string;
}): Promise<ApiSuccessResult> {
  const data = await fetchJson<ApiSuccessResult>("/api/inventory/suppliers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  ensureApiSuccess(data, "Failed to add supplier");
  return data;
}

export async function addInventoryProduct(
  body: AddInventoryProductInput,
): Promise<ApiSuccessResult> {
  const data = await fetchJson<ApiSuccessResult>("/api/inventory/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  ensureApiSuccess(data, "Failed to add product");
  return data;
}

export type InventoryImportFailure = {
  rowNumber: number;
  label: string;
  error: string;
};

export type InventoryImportResult = {
  success: boolean;
  attempted: number;
  succeeded: number;
  failures: InventoryImportFailure[];
  error?: string;
};

export async function importInventoryProducts(
  rows: AddInventoryProductInput[],
): Promise<InventoryImportResult> {
  return fetchJson<InventoryImportResult>("/api/inventory/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows }),
  });
}

export async function adjustInventoryStock(body: {
  productId: string;
  quantity: number;
  reason: string;
  adjustmentType: string;
}): Promise<ApiSuccessResult> {
  const data = await fetchJson<ApiSuccessResult>("/api/inventory/adjustment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  ensureApiSuccess(data, "Failed to adjust stock");
  return data;
}

export async function purchaseInventoryStock(body: {
  productId: string;
  quantity: number;
  costPrice: number;
  supplier: string;
}): Promise<ApiSuccessResult> {
  const data = await fetchJson<ApiSuccessResult>("/api/inventory/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  ensureApiSuccess(data, "Failed to purchase stock");
  return data;
}

export async function transferInventoryStock(body: {
  productId: string;
  product?: string;
  quantity: number;
  fromBranchId: string;
  toBranchId: string;
}): Promise<ApiSuccessResult & { newStock?: number; destinationStock?: number }> {
  const data = await fetchJson<ApiSuccessResult>("/api/inventory/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: body.productId,
      quantity: body.quantity,
      fromBranchId: body.fromBranchId,
      toBranchId: body.toBranchId,
    }),
  });
  ensureApiSuccess(data, "Failed to transfer stock");
  return data;
}

export async function deleteInventoryProduct(id: string): Promise<ApiSuccessResult> {
  const data = await fetchJson<ApiSuccessResult>(`/api/inventory/${id}`, {
    method: "DELETE",
  });
  ensureApiSuccess(data, "Failed to delete product");
  return data;
}

export async function updateInventoryProduct(
  id: string,
  body: UpdateInventoryProductInput,
): Promise<ApiSuccessResult> {
  const data = await fetchJson<ApiSuccessResult>(`/api/inventory/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  ensureApiSuccess(data, "Failed to update product");
  return data;
}

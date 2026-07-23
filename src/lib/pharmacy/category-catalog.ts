import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";
import { ApiError } from "@/lib/http/client";

export type CategoryCatalogItem = {
  id: string;
  name: string;
  description: string | null;
  /** Where the option came from (for debugging / future UI badges). */
  scope: "pharmacy" | "platform" | "global";
};

/**
 * Encodes a category catalog item into a stable string value for Select inputs.
 * Format: "scope:id"  e.g. "pharmacy:uuid" or "global:uuid"
 */
export function encodeCategoryCatalogValue(
  category: Pick<CategoryCatalogItem, "scope" | "id">,
): string {
  return `${category.scope}:${category.id}`;
}

/**
 * Decodes a catalog value string back into scope + id.
 */
export function decodeCategoryCatalogValue(value: string): {
  scope: CategoryCatalogItem["scope"];
  id: string;
} {
  const idx = value.indexOf(":");
  if (idx === -1) return { scope: "pharmacy", id: value };
  const scope = value.slice(0, idx) as CategoryCatalogItem["scope"];
  const id = value.slice(idx + 1);
  return { scope, id };
}

function mapScope(row: { scope?: string | null }) {
  if (row.scope === "global") return "global" as const;
  if (row.scope === "pharmacy") return "pharmacy" as const;
  return "platform" as const;
}

/** Platform + legacy global + pharmacy-specific categories for product forms. */
export async function listCategoryCatalog(
  pharmacyId: string,
): Promise<CategoryCatalogItem[]> {
  const { url } = resolveApiUrl("/api/categories");
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError("Failed to load categories", res.status, body);
  }
  const rows = (await res.json()) as Array<{
    id: string;
    name: string;
    description: string | null;
    scope?: string | null;
  }>;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    scope: mapScope(row),
  }));
}

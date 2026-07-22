import type { SeedPharmacyDemoResult } from "@/lib/seed/seed-pharmacy-demo";
import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";

export async function seedPharmacyDemoData(): Promise<SeedPharmacyDemoResult> {
  const res = await fetch(resolveApiUrl("/api/pharmacy/seed-demo-data").url, {
    method: "POST",
    credentials: "include",
  });
  const body = (await res.json()) as {
    success: boolean;
    error?: string;
    result?: SeedPharmacyDemoResult;
  };

  if (!res.ok || !body.success || !body.result) {
    throw new Error(body.error ?? "Failed to load demo data");
  }

  return body.result;
}

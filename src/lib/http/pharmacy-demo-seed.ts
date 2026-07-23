import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";

export type SeedPharmacyDemoResult = {
  pharmacyId: string;
  branchId: string;
  inventory: { created: number; skipped: number };
  customers: { created: number; skipped: number };
  insuranceProvider: { created: boolean; id?: string; name: string };
};

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

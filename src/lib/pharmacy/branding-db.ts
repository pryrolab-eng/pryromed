import type { PharmacyBranding } from "@/lib/http/pharmacy-branding";
import { updatePharmacyBranding } from "@/lib/http/pharmacy-branding";

export async function loadPharmacyBrandingRow(
  pharmacyId: string,
): Promise<PharmacyBranding | null> {
  return null;
}

export async function savePharmacyBrandingRow(
  pharmacyId: string,
  body: Partial<PharmacyBranding>,
): Promise<void> {
  await updatePharmacyBranding(body as PharmacyBranding);
}

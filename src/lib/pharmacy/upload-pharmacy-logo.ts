import { fetchJson } from "@/lib/http/client";

/**
 * Upload a pharmacy logo via the NestJS backend.
 * The backend handles Cloudinary (when configured) or local storage fallback.
 * Returns the CDN/local URL that was saved to pharmacies.logo_url.
 */
export async function uploadAndPersistPharmacyLogo(
  file: File,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const data = await fetchJson<{ success: boolean; logoUrl: string }>(
    "/api/uploads/logo",
    {
      method: "POST",
      body: form,
      // Don't set Content-Type — browser sets it with the boundary automatically
    },
  );

  return data.logoUrl;
}

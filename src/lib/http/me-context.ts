import { fetchJson } from "./client";
import { resolveApiUrl } from "./migrated-api-prefixes";

export type MeContextMembership = {
  pharmacyId: string;
  pharmacyName: string | null;
  role: string;
  isActive: boolean;
};

export type MeContextResponse = {
  user: {
    id: string;
    email: string | null;
    fullName: string | null;
    isPlatformAdmin: boolean;
  };
  activePharmacyId: string | null;
  activeBranchId: string | null;
  role: string | null;
  /** null = all branches; array = restricted list */
  allowedBranchIds: string[] | null;
  /** RBAC capability keys from pharmacy_role_permissions */
  permissions: string[];
  /** True when user must replace a temporary invite password before using the app. */
  mustChangePassword: boolean;
  memberships: MeContextMembership[];
};

export const meContextKeys = {
  all: ["me", "context"] as const,
};

export async function getMeContext(): Promise<MeContextResponse> {
  return fetchJson<MeContextResponse>("/api/me/context");
}

/**
 * Server-side variant that properly forwards session cookies to the Nest backend.
 * Use this in Next.js Server Components / layouts instead of `getMeContext()`.
 */
export async function getMeContextServer(): Promise<MeContextResponse> {
  const { cookies: serverCookies, headers: serverHeaders } = await import("next/headers");
  const store = await serverCookies();
  const secureCookie = store.get("__Secure-pryrox_session")?.value;
  const cookie = secureCookie ?? store.get("pryrox_session")?.value;
  if (!cookie) throw new Error("No session cookie");

  const cookieStr = `${secureCookie ? "__Secure-pryrox_session" : "pryrox_session"}=${cookie}`;
  const hdrs = await serverHeaders();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") ?? "https";

  // Server-rendered pages must contact Nest directly to avoid the rewrite loop.
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const { url } = resolveApiUrl("/api/me/context");
  const requestUrl = apiBase && url.startsWith("/")
    ? `${apiBase}${url}`
    : url;

  const res = await fetch(requestUrl, {
    headers: { Cookie: cookieStr },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`me/context returned ${res.status}`);
  return res.json() as Promise<MeContextResponse>;
}

export async function setActivePharmacy(pharmacyId: string) {
  return fetchJson<{
    success: boolean;
    activePharmacyId: string | null;
    activeBranchId: string | null;
    role: string | null;
  }>("/api/me/active-pharmacy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pharmacyId }),
  });
}

export async function setActiveBranch(branchId: string) {
  return fetchJson<{
    success: boolean;
    activePharmacyId: string | null;
    activeBranchId: string | null;
    role: string | null;
  }>("/api/me/active-branch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ branchId }),
  });
}

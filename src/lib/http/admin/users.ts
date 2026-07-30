import { fetchJson } from "@/lib/http/client";

export type AdminOrphanUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  emailConfirmed: boolean;
  isPlatformAdmin: boolean;
  lastSignInAt: string | null;
  createdAt: string | null;
  ageDays: number | null;
  hasPharmacy?: boolean;
};

export type AdminUsersListResponse = {
  users: AdminOrphanUser[];
  total: number;
  withoutPharmacy: boolean;
  note?: string;
};

export const adminUsersWithoutPharmacyQueryKey = [
  "admin",
  "users",
  "withoutPharmacy",
] as const;

export async function getAdminUsersWithoutPharmacy(params?: {
  q?: string;
  limit?: number;
}): Promise<AdminUsersListResponse> {
  const search = new URLSearchParams({ withoutPharmacy: "true" });
  if (params?.q?.trim()) search.set("q", params.q.trim());
  if (params?.limit) search.set("limit", String(params.limit));
  return fetchJson<AdminUsersListResponse>(
    `/api/admin/users?${search.toString()}`,
  );
}

export async function deleteAdminAuthUser(userId: string): Promise<void> {
  await fetchJson(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}

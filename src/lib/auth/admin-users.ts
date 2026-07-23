import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";

async function adminApi(method: string, path: string, body?: unknown) {
  const { url } = resolveApiUrl(`/api/admin${path}`);
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Admin API request failed");
  return data;
}

export async function adminCreateAuthUser(input: {
  email: string;
  password: string;
  fullName?: string;
  emailConfirmed?: boolean;
  userMetadata?: Record<string, unknown>;
}): Promise<{ user: { id: string; email: string } }> {
  return adminApi("POST", "/users", { email: input.email, password: input.password, fullName: input.fullName });
}

export async function adminUpdateAuthUserPassword(userId: string, password: string): Promise<void> {
  await adminApi("PUT", `/users/${userId}/password`, { password });
}

export async function adminUpdateAuthUserEmail(userId: string, email: string): Promise<void> {
  await adminApi("PUT", `/users/${userId}/email`, { email });
}

export async function adminGetAuthUserById(userId: string): Promise<{
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown>;
} | null> {
  const { url } = resolveApiUrl(`/api/admin/users/${userId}`);
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to get user");
  return res.json();
}

export async function adminUpdateAuthUserMetadata(userId: string, metadata: Record<string, unknown>): Promise<void> {
  await adminApi("PUT", `/users/${userId}/metadata`, metadata);
}

export async function adminDeleteAuthUser(userId: string): Promise<void> {
  await adminApi("DELETE", `/users/${userId}`);
}

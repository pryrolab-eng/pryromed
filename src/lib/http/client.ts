/**
 * Low-level JSON fetch helpers for Next.js Route Handlers (`/api/...`).
 * Migrated domains call the Nest backend via NEXT_PUBLIC_API_URL.
 * Hooks and UI should call domain modules (e.g. `getStaffUsers`) instead of this directly.
 */

import { resolveApiUrl } from "./migrated-api-prefixes";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function errorMessageFromBody(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return fallback;
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function fetchJsonOnce<T>(
  url: string,
  init: RequestInit | undefined,
  credentials: RequestCredentials,
): Promise<{ res: Response; data: unknown }> {
  const res = await fetch(url, {
    cache: "no-store",
    credentials,
    ...init,
  });
  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { res, data };
}

/**
 * `fetch` then `res.json()`, throwing {@link ApiError} when `!res.ok`.
 */
export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const path =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.pathname + input.search
        : String(input);

  const { url, isNest } = resolveApiUrl(path);
  const credentials: RequestCredentials = isNest ? "include" : "same-origin";

  let { res, data } = await fetchJsonOnce(url, init, credentials);

  if (res.status === 401 && isNest) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      ({ res, data } = await fetchJsonOnce(url, init, credentials));
    }
  }

  if (!res.ok) {
    const message = errorMessageFromBody(
      data,
      `Request failed (${res.status})`,
    );
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

/**
 * Some route handlers return HTTP 200 with `{ success: false, error }` (e.g. admin pharmacy create).
 */
export function ensureApiSuccess(data: unknown, fallbackMessage: string): void {
  if (
    data &&
    typeof data === "object" &&
    "success" in data &&
    (data as { success: unknown }).success === false
  ) {
    const err = (data as { error?: unknown }).error;
    throw new Error(typeof err === "string" ? err : fallbackMessage);
  }
}

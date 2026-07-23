import type { NextRequest } from "next/server";
import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";
import type { AuthUser } from "@/lib/auth/types";

export type { AuthUser };

export async function getAuthUser(request?: NextRequest): Promise<AuthUser | null> {
  try {
    let cookieStr = "";
    let origin = request?.nextUrl.origin;

    if (request) {
      const cookie = request.cookies.get("pryrox_session")?.value || request.cookies.get("__Secure-pryrox_session")?.value;
      if (cookie) cookieStr = `pryrox_session=${cookie}`;
    } else {
      const { cookies: serverCookies, headers: serverHeaders } = await import("next/headers");
      const store = await serverCookies();
      const cookie = store.get("pryrox_session")?.value || store.get("__Secure-pryrox_session")?.value;
      if (cookie) cookieStr = `pryrox_session=${cookie}`;

      const headers = await serverHeaders();
      const host = headers.get("x-forwarded-host") ?? headers.get("host");
      const protocol = headers.get("x-forwarded-proto") ?? "https";
      if (host) origin = `${protocol}://${host}`;
    }

    if (!cookieStr) return null;

    const { url } = resolveApiUrl("/api/auth/me");
    // Server-rendered pages should contact Nest directly. A request back into
    // this Vercel deployment can miss its rewrite and send the user through
    // the sign-in middleware again, creating an /app redirect loop.
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    const requestUrl = apiBase && url.startsWith("/")
      ? `${apiBase}${url}`
      : url.startsWith("/") && origin
        ? new URL(url, origin)
        : url;
    const res = await fetch(requestUrl, { headers: { Cookie: cookieStr } });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function requireAuthUser(request?: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user) throw new Error("Unauthorized");
  return user;
}

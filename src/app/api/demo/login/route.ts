import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth/auth-mode";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * POST /api/demo/login
 *
 * Proxies the demo login request to the NestJS backend, extracts the
 * session cookies from the backend response, and re-sets them on the
 * frontend domain so the Next.js middleware can read them.
 *
 * This is necessary because the backend runs on a different port (4000)
 * and cannot set cookies on the frontend origin (3000) directly.
 */
export async function POST() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const backendRes = await fetch(`${API_URL}/api/demo/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // OriginGuard requires either Origin or Referer on mutating requests.
        // Server-to-server fetches have neither, so we supply them explicitly.
        "Origin": appUrl,
        "Referer": `${appUrl}/demo`,
      },
    });

    const body = await backendRes.json() as {
      success?: boolean;
      redirectTo?: string;
      userId?: string;
      pharmacyId?: string;
      error?: string;
    };

    if (!backendRes.ok || !body.success) {
      return NextResponse.json(
        { error: body.error ?? "Demo login failed" },
        { status: backendRes.status || 500 },
      );
    }

    // Extract Set-Cookie headers from the backend response
    const setCookieHeader = backendRes.headers.get("set-cookie");
    const res = NextResponse.json(body);

    if (setCookieHeader) {
      // Parse individual cookies from the combined Set-Cookie header
      // and re-apply them on the frontend domain
      const cookies = setCookieHeader.split(/,(?=[^;]+=[^;]+)/);

      for (const rawCookie of cookies) {
        const [nameValue, ...attributes] = rawCookie.trim().split(";");
        if (!nameValue) continue;

        const eqIdx = nameValue.indexOf("=");
        if (eqIdx === -1) continue;

        const name = nameValue.slice(0, eqIdx).trim();
        const value = nameValue.slice(eqIdx + 1).trim();

        if (!name || !value) continue;

        // Parse attributes
        const attrMap: Record<string, string | boolean> = {};
        for (const attr of attributes) {
          const [k, v] = attr.trim().split("=");
          if (k) attrMap[k.trim().toLowerCase()] = v?.trim() ?? true;
        }

        const isSecure = process.env.NODE_ENV === "production";
        const maxAge = typeof attrMap["max-age"] === "string"
          ? parseInt(attrMap["max-age"], 10)
          : undefined;

        res.cookies.set(name, value, {
          httpOnly: true,
          secure: isSecure,
          sameSite: "lax",
          path: "/",
          ...(maxAge !== undefined ? { maxAge } : {}),
        });
      }
    } else {
      // Backend didn't forward cookies — fall back to reading JWT from body
      // This shouldn't happen in normal flow
      return NextResponse.json(
        { error: "No session cookies returned from backend" },
        { status: 500 },
      );
    }

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not reach backend";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

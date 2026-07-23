import type { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/auth/auth-mode";
import { ACCESS_SESSION_TTL_MS, signSessionJwt, verifyRefreshJwt, verifySessionJwt } from "@/lib/auth/native/session-jwt";

export async function trySilentNativeAccessRefresh(request: NextRequest, response: NextResponse): Promise<boolean> {
  const accessJwt = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (accessJwt && (await verifySessionJwt(accessJwt))) {
    return false;
  }

  const refreshJwt = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshJwt) return false;

  const payload = await verifyRefreshJwt(refreshJwt);
  if (!payload) return false;

  const accessExpiresAt = new Date(Date.now() + ACCESS_SESSION_TTL_MS);
  const newAccessJwt = await signSessionJwt(payload, accessExpiresAt);
  response.cookies.set(SESSION_COOKIE_NAME, newAccessJwt, { path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: accessExpiresAt });
  return true;
}

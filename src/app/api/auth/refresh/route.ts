import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth/auth-mode";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") ?? "";

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { cookie: cookieHeader },
  });

  const body = await res.json().catch(() => ({}));
  const response = NextResponse.json(body, { status: res.status });

  // Forward Set-Cookie headers from backend to browser
  const setCookies = res.headers.getSetCookie?.() ?? [];
  for (const header of setCookies) {
    const match = header.match(/^((?:__Secure-)?pryrox_(?:session|refresh))=([^;]+)/);
    if (match) {
      const [, name, value] = match;
      response.cookies.set(name, value, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  return response;
}

import { SignJWT, jwtVerify } from "jose";

export const ACCESS_SESSION_TTL_MS = 60 * 60 * 1000;
export const REFRESH_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getSecret(): Uint8Array {
  return new TextEncoder().encode((process.env.AUTH_SECRET ?? "").trim());
}

export async function verifySessionJwt(token: string): Promise<{ sub: string; sid: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || !payload.sid || typeof payload.sub !== "string" || typeof payload.sid !== "string") return null;
    if (payload.typ === "refresh") return null;
    return { sub: payload.sub, sid: payload.sid };
  } catch { return null; }
}

export async function verifyRefreshJwt(token: string): Promise<{ sub: string; sid: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || !payload.sid || typeof payload.sub !== "string" || typeof payload.sid !== "string") return null;
    if (payload.typ !== "refresh") return null;
    return { sub: payload.sub, sid: payload.sid };
  } catch { return null; }
}

export async function signSessionJwt(payload: { sub: string; sid: string }, expiresAt?: Date): Promise<string> {
  const exp = expiresAt ?? new Date(Date.now() + ACCESS_SESSION_TTL_MS);
  return new SignJWT({ sid: payload.sid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setExpirationTime(Math.floor(exp.getTime() / 1000))
    .setIssuedAt()
    .sign(getSecret());
}

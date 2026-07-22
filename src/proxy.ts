import { updateSession } from "@/lib/middleware/update-session";
import { type NextRequest } from "next/server";

/**
 * Renamed from `middleware.ts` (deprecated in Next 16). A `proxy.ts` file runs
 * on the Node.js runtime, so it is NOT subject to the 1 MB Edge Function bundle
 * limit and can safely import Prisma-backed modules (rate limiting, IP
 * whitelist, maintenance mode, platform-admin checks) used by updateSession.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Must be a static string (or static array of strings) — Next.js cannot
 * analyze spread/computed matchers at compile time. Path gating uses
 * middlewareShouldRun() in lib/middleware/auth-routes.ts.
 */
export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static, _next/image  (Next.js internals)
     * - favicon.ico, static assets
     * - @vite, @react-refresh, src/main.jsx (browser extension probes)
     * - sw.js, icon-*.png (PWA probes)
     * - Public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|@vite|@react-refresh|sw\\.js|workbox-|icon-\\d+\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|css|js\\.map)$).+)",
  ],
};

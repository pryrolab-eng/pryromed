"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  hasSensitiveAuthQueryParams,
  stripSensitiveAuthQueryParams,
} from "@/lib/auth/sensitive-query-params";

function replaceUrlQuietly(pathname: string, query: string) {
  const href = query ? `${pathname}?${query}` : pathname;
  window.history.replaceState(window.history.state, "", href);
}

/** Removes credentials/tokens from the address bar on auth pages. */
export function AuthSensitiveParamsGuard() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const stripped = useRef(false);

  useEffect(() => {
    if (stripped.current) return;
    if (!hasSensitiveAuthQueryParams(searchParams)) return;

    stripped.current = true;
    const { sanitized } = stripSensitiveAuthQueryParams(searchParams);
    replaceUrlQuietly(pathname, sanitized.toString());
  }, [pathname, searchParams]);

  return null;
}

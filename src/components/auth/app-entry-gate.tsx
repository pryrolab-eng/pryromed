"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useIsRestoring, useQueryClient } from "@tanstack/react-query";
import { AppEntryLoader } from "@/components/auth/app-entry-loader";
import { AppEntrySetPassword } from "@/components/auth/app-entry-set-password";
import { meContextKeys } from "@/lib/http/me-context";
import { pharmacyDashboardKeys } from "@/lib/http/pharmacy-dashboard";
import { saasKeys } from "@/lib/http/saas";
import { entitlementsKeys } from "@/lib/http/entitlements";
import { staffUsersQueryKey } from "@/lib/http/staff";
interface SessionBootstrapPayload {
  ok: boolean; path: string; mustChangePassword: boolean;
  me: { user: { id: string; email: string | null; fullName: string | null; isPlatformAdmin: boolean }; activePharmacyId: string | null; activeBranchId: string | null; role: string | null; allowedBranchIds: string[] | null; permissions: string[]; mustChangePassword: boolean; memberships: Array<{ pharmacyId: string; pharmacyName: string | null; role: string | null; isActive: boolean }> };
  entitlements: null; dashboard: Record<string, unknown> | null; subscription: null; plans: null; staff: null;
}
import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";

/** Abort and offer retry if bootstrap takes too long (dev cold-compile can exceed 20s). */
const MAX_WAIT_MS = 60_000;

type Phase = "resolving" | "set-password" | "redirecting" | "error";

function seedBootstrapCache(
  queryClient: ReturnType<typeof useQueryClient>,
  payload: SessionBootstrapPayload,
) {
  queryClient.setQueryData(meContextKeys.all, payload.me);

  if (payload.entitlements) {
    queryClient.setQueryData(
      entitlementsKeys.pharmacy(),
      payload.entitlements,
    );
  }

  if (payload.dashboard) {
    // Match useCombinedPharmacyDashboard key exactly.
    queryClient.setQueryData(
      pharmacyDashboardKeys.combined(undefined, 30),
      payload.dashboard,
    );
    // Also seed legacy sales-chart key if anything still reads it.
    queryClient.setQueryData(
      pharmacyDashboardKeys.salesChart(),
      payload.dashboard.salesChart,
    );
  }

  if (payload.subscription) {
    queryClient.setQueryData(saasKeys.subscription(), payload.subscription);
  }

  if (payload.plans) {
    queryClient.setQueryData(saasKeys.plans(), payload.plans);
  }

  if (payload.staff) {
    queryClient.setQueryData(staffUsersQueryKey, payload.staff);
  }
}

export function AppEntryGate() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isRestoring = useIsRestoring();
  const [phase, setPhase] = useState<Phase>("resolving");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const runId = useRef(0);
  const navigatedRef = useRef(false);

  const redirectTo = useCallback(
    (path: string) => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      setPhase("redirecting");
      // `/app` is only an entry gate. Use a document navigation for the final
      // handoff so Next does not keep the entry route in its client cache.
      window.location.replace(path);
    },
    [router],
  );

  const resolveAndRedirect = useCallback(async () => {
    const id = ++runId.current;
    setPhase("resolving");
    setErrorMessage(null);
    navigatedRef.current = false;

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        MAX_WAIT_MS,
      );

      const { url: bootstrapUrl } = resolveApiUrl("/api/auth/bootstrap");
      const res = await fetch(bootstrapUrl, {
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      if (runId.current !== id) return;

      if (res.status === 401) {
        router.replace("/sign-in");
        return;
      }

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("Retry-After"));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0
          ? ` Please try again in ${Math.ceil(retryAfter / 60)} minute${retryAfter > 60 ? "s" : ""}.`
          : " Please wait a few minutes and try again.";
        throw new Error(`Too many requests from this connection.${wait}`);
      }

      const body = (await res.json()) as
        | SessionBootstrapPayload
        | { ok?: false; reason?: string };

      if (!res.ok || !body.ok || !("path" in body) || !body.path) {
        throw new Error("Could not determine where to send you.");
      }

      if (body.mustChangePassword) {
        queryClient.setQueryData(meContextKeys.all, body.me);
        setPhase("set-password");
        return;
      }

      seedBootstrapCache(queryClient, body);

      if (runId.current !== id) return;
      redirectTo(body.path);
    } catch (err) {
      if (runId.current !== id) return;
      const aborted = err instanceof Error && err.name === "AbortError";
      setPhase("error");
      setErrorMessage(
        aborted
          ? "This is taking longer than expected. Check your connection and try again."
          : err instanceof Error
            ? err.message
            : "Something went wrong.",
      );
    }
  }, [queryClient, redirectTo, router]);

  const handlePasswordSet = useCallback(() => {
    navigatedRef.current = false;
    void queryClient.invalidateQueries({ queryKey: meContextKeys.all });
    setPhase("redirecting");
    void resolveAndRedirect();
  }, [queryClient, resolveAndRedirect]);

  useEffect(() => {
    // Wait until persisted RQ cache finishes restoring so bootstrap seed is not wiped.
    if (isRestoring) return;
    void resolveAndRedirect();
    return () => {
      runId.current += 1;
    };
  }, [isRestoring, resolveAndRedirect]);

  if (phase === "set-password") {
    return <AppEntrySetPassword onComplete={handlePasswordSet} />;
  }

  return (
    <AppEntryLoader
      phase={phase}
      errorMessage={errorMessage}
      onRetry={
        phase === "error" ? () => void resolveAndRedirect() : undefined
      }
    />
  );
}

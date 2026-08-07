"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, AlertTriangle } from "lucide-react";

type DemoState =
  | { status: "loading" }
  | { status: "success"; redirectTo: string }
  | { status: "error"; message: string };

export default function DemoPage() {
  const router = useRouter();
  const [state, setState] = useState<DemoState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function startDemo() {
      try {
        const res = await fetch("/api/demo/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (cancelled) return;

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          setState({
            status: "error",
            message: body.error ?? `Server returned ${res.status}`,
          });
          return;
        }

        const data = (await res.json()) as {
          success: boolean;
          redirectTo?: string;
          error?: string;
        };

        if (!data.success) {
          setState({ status: "error", message: data.error ?? "Demo login failed" });
          return;
        }

        const redirectTo = data.redirectTo ?? "/pharmacy/dashboard";
        setState({ status: "success", redirectTo });
        router.push(redirectTo);
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Could not reach the server",
        });
      }
    }

    void startDemo();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-neutral-50 px-4 dark:bg-neutral-950">
      <Logo className="opacity-90" />

      {state.status === "loading" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner className="size-8 text-neutral-500" />
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Setting up your demo session…
          </p>
          <p className="max-w-xs text-xs text-neutral-400 dark:text-neutral-600">
            Pre-loaded with sample inventory, sales, and staff data.
          </p>
        </div>
      )}

      {state.status === "success" && (
        <div className="flex flex-col items-center gap-2 text-center">
          <CheckCircle2 className="size-8 text-green-500" />
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Demo session ready — redirecting…
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div className="flex max-w-sm flex-col items-center gap-4 rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm dark:border-red-900/40 dark:bg-neutral-900">
          <AlertTriangle className="size-8 text-red-500" />
          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              Demo unavailable
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {state.message}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
            <a
              href="/sign-in"
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Sign in instead
            </a>
          </div>
        </div>
      )}

      <p className="text-xs text-neutral-400 dark:text-neutral-600">
        Demo data resets every 24 hours. Do not enter real patient data.
      </p>
    </div>
  );
}

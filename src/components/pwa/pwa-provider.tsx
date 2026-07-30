"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { toast } from "sonner";
import { AppIcon } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pryrox.pwa.install.dismissed";

/**
 * Registers the PWA service worker, offers install, and prompts on updates.
 */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const enableWorker =
      process.env.NODE_ENV === "production" ||
      window.localStorage.getItem("pryrox.pwa.dev") === "1";

    if (!enableWorker) {
      // Avoid SW fighting Next HMR in normal local dev.
      // Opt in: localStorage.setItem('pryrox.pwa.dev','1'); location.reload()
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      const dismissed = window.localStorage.getItem(DISMISS_KEY);
      if (dismissed === "1") return;
      setInstallEvent(event as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    void navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        const promptUpdate = () => {
          toast("A new Pryrox version is ready", {
            description: "Reload to get the latest fixes and features.",
            duration: 20_000,
            action: {
              label: "Reload",
              onClick: () => {
                registration.waiting?.postMessage({ type: "SKIP_WAITING" });
                window.location.reload();
              },
            },
          });
        };

        if (registration.waiting) promptUpdate();

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              promptUpdate();
            }
          });
        });

        const interval = window.setInterval(() => {
          void registration.update();
        }, 60 * 60 * 1000);

        return () => window.clearInterval(interval);
      })
      .catch((error) => {
        console.warn("Service worker registration failed:", error);
      });

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setShowInstall(false);
      setInstallEvent(null);
    }
  };

  const dismissInstall = () => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setShowInstall(false);
  };

  return (
    <>
      {children}
      {showInstall && installEvent ? (
        <div
          className={cn(
            "fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md",
            "rounded-xl border border-neutral-200 bg-white p-4 shadow-lg",
            "dark:border-neutral-800 dark:bg-neutral-950",
          )}
          role="dialog"
          aria-label="Install Pryrox"
        >
          <div className="flex items-start gap-3">
            <AppIcon size={40} className="rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                Install Pryrox
              </p>
              <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                Add to your home screen for faster access, full-screen pharmacy
                tools, and better offline handling.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => void handleInstall()}>
                  Install
                </Button>
                <Button size="sm" variant="ghost" onClick={dismissInstall}>
                  Not now
                </Button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissInstall}
              className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-900"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Compact control for settings / account menus. */
export function PwaInstallButton({ className }: { className?: string }) {
  const [canInstall, setCanInstall] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!canInstall || !deferred) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={async () => {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === "accepted") {
          setCanInstall(false);
          setDeferred(null);
        }
      }}
    >
      <Download className="mr-1.5 size-3.5" />
      Install app
    </Button>
  );
}

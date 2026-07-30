"use client";

import { useEffect, useRef } from "react";
import { showVerificationToast } from "@/components/auth/verification-toast";

function decodeAuthMessage(raw: string) {
  return decodeURIComponent(raw.replace(/\+/g, " "));
}

/**
 * Handles legacy hash-based auth errors (#error=...) on the client.
 * Native email confirmation uses query params on dedicated routes instead.
 */
export function AuthHashHandler() {
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current || typeof window === "undefined") return;

    const hash = window.location.hash.slice(1);
    if (!hash) return;

    handled.current = true;
    const params = new URLSearchParams(hash);
    const errorCode = params.get("error_code");
    const errorDescription = params.get("error_description");
    const error = params.get("error");

    const clearHash = () => {
      const path = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", path);
    };

    if (error || errorCode || errorDescription) {
      const message = errorDescription
        ? decodeAuthMessage(errorDescription)
        : error
          ? decodeAuthMessage(error)
          : "Could not complete sign in.";

      clearHash();

      if (errorCode === "otp_expired") {
        showVerificationToast({
          message:
            "This confirmation link has expired. Resend a new confirmation email.",
        });
        // Full navigation avoids App Router init races during cold/HMR loads.
        window.location.assign("/verify-email?expired=1");
        return;
      }

      showVerificationToast({ message });
      window.location.assign("/sign-in?expired=1");
      return;
    }

    clearHash();
  }, []);

  return null;
}

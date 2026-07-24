"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="mx-auto max-w-md text-center">
            <p className="text-6xl font-bold text-red-300">!</p>
            <h1 className="mt-4 text-2xl font-semibold text-gray-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-gray-600">
              An unexpected error occurred. Please try again.
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-gray-400">
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

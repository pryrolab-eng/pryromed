"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("POS error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <span className="text-xl text-red-600">!</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          POS system error
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          The point-of-sale system encountered an error. Your cart data is
          preserved locally.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try again
          </button>
          <button
            onClick={() => router.push("/pharmacy/dashboard")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

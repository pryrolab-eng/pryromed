"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
  useEffect(() => {
    console.error("404: Page not found", window.location.pathname);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-md text-center">
        <p className="text-6xl font-bold text-gray-300 dark:text-gray-700">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

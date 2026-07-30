import Image from "next/image";
import Link from "next/link";
import { PRYROX_APP_ICONS } from "@/lib/brand/icons";

export const metadata = {
  title: "Offline — Pryrox",
  robots: { index: false, follow: false },
};

/** Shown when navigation fails while offline (service worker document fallback). */
export default function OfflinePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-white px-6 text-center dark:bg-neutral-950">
      <div className="flex max-w-md flex-col items-center gap-4">
        <Image
          src={PRYROX_APP_ICONS.icon192}
          alt="Pryrox"
          width={56}
          height={56}
          className="rounded-2xl"
          priority
        />
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          You&apos;re offline
        </h1>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Pryrox needs a connection for live pharmacy data. Check your network,
          then try again. Previously opened screens may still work from cache.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/app"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#003459] px-4 text-sm font-medium text-white hover:bg-[#002a47]"
          >
            Retry
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-200 px-4 text-sm font-medium text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

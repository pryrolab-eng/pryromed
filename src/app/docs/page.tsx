import Link from "next/link";

const sections = [
  {
    slug: "user-manual",
    title: "User Manual",
    description:
      "Complete guide for cashiers and pharmacy managers: sales, refunds, shifts, receipts, insurance, and EBM fiscal receipts.",
    badge: "For cashiers & managers",
  },
  {
    slug: "installation",
    title: "Installation Guide",
    description:
      "Step-by-step server setup, database configuration, backend and frontend deployment, and VSDC connection.",
    badge: "For IT / system admins",
  },
  {
    slug: "configuration",
    title: "Programming & Configuration Manual",
    description:
      "EBM/VSDC configuration: TIN setup, tax rates, device initialization, item classification codes, and API reference.",
    badge: "For technical integrators",
  },
  {
    slug: "ebm-integration",
    title: "RRA EBM / VSDC Integration Guide",
    description:
      "How Pryrox integrates with the Rwanda Revenue Authority VSDC: receipt types, data flow, offline queue, and Z-reports.",
    badge: "RRA compliance",
  },
  {
    slug: "api",
    title: "API Reference",
    description:
      "Full REST API reference for the Pryrox backend including all EBM, POS, inventory, reports, and settings endpoints.",
    badge: "For developers",
  },
];

export default function DocsHomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-block bg-neutral-900 text-white text-2xl font-bold px-4 py-2 rounded-lg mb-6 tracking-tight">
          PRYROX
        </div>
        <h1 className="text-4xl font-bold text-neutral-900 mb-3">
          Documentation
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl">
          Official product documentation for the Pryrox Pharmacy Management
          Platform. Find guides for end users, system administrators, and
          technical integrators.
        </p>
      </div>

      {/* Doc cards */}
      <div className="grid gap-4">
        {sections.map((section) => (
          <Link
            key={section.slug}
            href={`/docs/${section.slug}`}
            className="group block border border-neutral-200 rounded-xl p-6 hover:border-neutral-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-0.5 mb-2">
                  {section.badge}
                </span>
                <h2 className="text-lg font-semibold text-neutral-900 group-hover:text-blue-700 transition-colors mb-1">
                  {section.title}
                </h2>
                <p className="text-sm text-neutral-600">{section.description}</p>
              </div>
              <svg
                className="h-5 w-5 text-neutral-400 group-hover:text-neutral-700 transition-colors mt-1 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* RRA compliance note */}
      <div className="mt-12 border border-amber-200 bg-amber-50 rounded-xl p-6">
        <h3 className="font-semibold text-amber-900 mb-1">
          RRA EBM Certification
        </h3>
        <p className="text-sm text-amber-800">
          Pryrox is designed as a Certified Invoicing System (CIS) compliant
          with the Rwanda Revenue Authority (RRA) VSDC Technical Specification
          v1.0 (2018) and VSDC API Documentation v1.0.5 (2022). This
          documentation forms part of the RRA CIS/VSDC certification
          submission.
        </p>
      </div>

      <footer className="mt-16 pt-8 border-t border-neutral-200 text-sm text-neutral-500 flex items-center justify-between flex-wrap gap-4">
        <span>© {new Date().getFullYear()} Pryrox — All rights reserved</span>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-neutral-800 transition-colors">
            Back to app
          </Link>
          <a
            href="mailto:support@pryrox.com"
            className="hover:text-neutral-800 transition-colors"
          >
            Support
          </a>
        </div>
      </footer>
    </div>
  );
}

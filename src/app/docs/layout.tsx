import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pryrox Documentation",
  description:
    "Official documentation for the Pryrox Pharmacy Management Platform — user guides, installation, API reference, and RRA EBM compliance.",
  openGraph: {
    title: "Pryrox Documentation",
    description: "Pryrox Pharmacy Platform — official product documentation",
    type: "website",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased font-sans">
      {children}
    </div>
  );
}

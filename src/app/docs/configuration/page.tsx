import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuration Manual — Pryrox Documentation",
  description:
    "EBM/VSDC configuration guide: TIN setup, tax rates A/B/C/D, VSDC initialization, item classification codes, and API reference for Pryrox.",
};

export default function ConfigurationPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-6">
        <Link href="/docs" className="text-sm text-blue-600 hover:underline">← Documentation</Link>
      </div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Programming &amp; Configuration Manual</h1>
      <p className="text-neutral-600 mb-8">EBM/VSDC integration configuration, tax rate setup, item mapping, and API reference.</p>

      <div className="space-y-10 text-sm text-neutral-700">

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">Configuration Sequence</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r text-sm text-blue-900">
            <strong>Complete in order:</strong> TIN &amp; company → Tax rates → VSDC URL &amp; credentials → Device initialization → Item classification mapping → Item sync → Verification
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">Step 1 — Configure TIN and Company Details</h2>
          <p>Go to <strong>Settings → Pharmacy Profile</strong>. Enter the pharmacy name (must match RRA records exactly), 9-digit TIN, address (minimum 3 lines for receipt header), and phone number.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">Step 2 — Tax Rates (A, B, C, D)</h2>
          <table className="w-full border-collapse">
            <thead><tr className="bg-neutral-900 text-white"><th className="p-2 text-left">Class</th><th className="p-2 text-left">Rate</th><th className="p-2 text-left">Description</th></tr></thead>
            <tbody>
              {[
                ["A", "0%", "Tax-exempt (AEX) — e.g. basic food items"],
                ["B", "18%", "Standard VAT — most pharmaceutical products"],
                ["C", "0%", "Zero-rated"],
                ["D", "0%", "Other zero-rated"],
              ].map(([c, r, d], i) => (
                <tr key={c} className={i % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                  <td className="p-2 border-b border-neutral-200 font-bold">{c}</td>
                  <td className="p-2 border-b border-neutral-200">{r}</td>
                  <td className="p-2 border-b border-neutral-200 text-neutral-600">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-neutral-600">Assign tax class per medication in <strong>Inventory → Medications → Edit</strong>. Default is B (18%) if not set.</p>
          <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r text-amber-800">
            <strong>Formula:</strong> Tax B = <code>round(lineTotal × 18 / 118, 2)</code> — VAT is extracted from the tax-inclusive price.
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">Step 3 — VSDC Connection Settings</h2>
          <table className="w-full border-collapse">
            <thead><tr className="bg-neutral-900 text-white"><th className="p-2 text-left">Field</th><th className="p-2 text-left">Description</th><th className="p-2 text-left">Example</th></tr></thead>
            <tbody>
              {[
                ["RRA TIN", "9-digit pharmacy TIN", "999000099"],
                ["VSDC Base URL", "Local VSDC WAR URL", "http://localhost:8080"],
                ["Branch ID (bhf_id)", "2-char branch code", "00"],
                ["Device Serial", "Provided by VSDC vendor", "dvc999993204"],
                ["Device Number", "Provided by VSDC vendor", "9990000997006310"],
              ].map(([f, d, e], i) => (
                <tr key={f} className={i % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                  <td className="p-2 border-b border-neutral-200 font-medium">{f}</td>
                  <td className="p-2 border-b border-neutral-200 text-neutral-600">{d}</td>
                  <td className="p-2 border-b border-neutral-200 font-mono text-xs text-blue-700">{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3">Go to <strong>Settings → EBM / VSDC Integration</strong>, fill in the fields, and click <strong>Save Settings</strong>. Initialization is triggered automatically.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">Step 4 — Device Initialization</h2>
          <p>The system calls <code className="bg-neutral-100 px-1 rounded">POST /initializer/selectInitInfo</code> on the VSDC with TIN, branch ID, and device serial. On success, the SDC ID and MRC number are stored and displayed.</p>
          <p className="mt-2">To manually re-initialize: go to <strong>Settings → EBM</strong> and click <strong>Re-initialize Device</strong>, or call:</p>
          <pre className="mt-2 bg-neutral-900 text-green-400 p-3 rounded-lg text-xs">POST /api/integrations/rra-ebm/initialize</pre>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">Steps 5–7 — Item Classification &amp; Sync</h2>
          <ol className="space-y-2">
            <li>Fetch UNSPSC codes: <code className="bg-neutral-100 px-1 rounded">GET /api/integrations/rra-ebm/item-classes</code></li>
            <li>Assign the appropriate classification code to each medication in <strong>Inventory → Medications → Edit</strong>.</li>
            <li>Sync all items to VSDC: click <strong>Sync Items</strong> in EBM settings, or call <code className="bg-neutral-100 px-1 rounded">POST /api/integrations/rra-ebm/sync-items</code>.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">API Reference — EBM Endpoints</h2>
          <table className="w-full border-collapse text-xs">
            <thead><tr className="bg-neutral-900 text-white"><th className="p-2 text-left">Method</th><th className="p-2 text-left">Endpoint</th><th className="p-2 text-left">Description</th></tr></thead>
            <tbody>
              {[
                ["GET", "/api/integrations/rra-ebm/settings", "Retrieve EBM settings"],
                ["PUT", "/api/integrations/rra-ebm/settings", "Save settings & initialize"],
                ["POST", "/api/integrations/rra-ebm/initialize", "Manual device re-initialization"],
                ["GET", "/api/integrations/rra-ebm/status", "VSDC connectivity & queue status"],
                ["POST", "/api/integrations/rra-ebm/sync-items", "Sync medications to VSDC"],
                ["GET", "/api/integrations/rra-ebm/codes", "Fetch VSDC system codes"],
                ["GET", "/api/integrations/rra-ebm/item-classes", "Fetch UNSPSC codes"],
                ["GET", "/api/integrations/rra-ebm/customers/:tin", "Validate customer TIN"],
                ["GET", "/api/integrations/rra-ebm/notices", "Fetch RRA notices"],
                ["POST", "/api/integrations/rra-ebm/import-items", "Get importation details"],
                ["POST", "/api/integrations/rra-ebm/import-items/status", "Update import status"],
                ["GET", "/api/integrations/rra-ebm/purchases", "List unconfirmed purchases"],
                ["POST", "/api/integrations/rra-ebm/purchases/:id/confirm", "Confirm purchase"],
                ["GET", "/api/integrations/rra-ebm/x-report", "Intra-day X-Report"],
                ["GET", "/api/reports/plu", "PLU report (quantities & stock)"],
                ["GET", "/api/reports/detailed?type=…", "Sales/purchases/stock/items/importation"],
              ].map(([m, p, d], i) => (
                <tr key={p} className={i % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                  <td className={`p-2 border-b border-neutral-200 font-bold ${m === "GET" ? "text-green-700" : m === "PUT" ? "text-blue-700" : "text-orange-700"}`}>{m}</td>
                  <td className="p-2 border-b border-neutral-200 font-mono text-xs">{p}</td>
                  <td className="p-2 border-b border-neutral-200 text-neutral-600">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-neutral-200 flex items-center justify-between text-sm text-neutral-500 flex-wrap gap-4">
        <span>Pryrox Configuration Manual · Version 1.0</span>
        <Link href="/docs" className="text-blue-600 hover:underline">← All documentation</Link>
      </div>
    </div>
  );
}

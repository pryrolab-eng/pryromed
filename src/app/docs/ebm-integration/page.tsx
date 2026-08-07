import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RRA EBM / VSDC Integration Guide — Pryrox Documentation",
  description:
    "How Pryrox integrates with the Rwanda Revenue Authority VSDC: receipt types, data flow, tax computation, offline queue, and Z-reports.",
};

export default function EbmIntegrationPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-6">
        <Link href="/docs" className="text-sm text-blue-600 hover:underline">← Documentation</Link>
      </div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">RRA EBM / VSDC Integration Guide</h1>
      <p className="text-neutral-600 mb-8">
        How Pryrox (as a Certified Invoicing System) integrates with the Rwanda Revenue Authority
        VSDC API v1.0.5 to produce signed fiscal receipts.
      </p>

      <div className="space-y-10 text-sm text-neutral-700">

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">Architecture</h2>
          <pre className="bg-neutral-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`Pryrox POS (sale completed)
        │
        ▼
EBM Adapter (lib/ebm/)
        │  POST /trnsSales/saveSales
        ▼
VSDC WAR (localhost:8080)
        │  HTTPS + SSL
        ▼
RRA EBM 2.1 API Server
        │
        ▼  Response: rcptNo, intrlData, rcptSign, sdcId, mrcNo
Pryrox stores fiscal data on sale record
        │
        ▼
Receipt printed with SDC Information block + QR code`}</pre>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">Receipt Types</h2>
          <table className="w-full border-collapse">
            <thead><tr className="bg-neutral-900 text-white"><th className="p-2 text-left">Label</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Transaction</th><th className="p-2 text-left">VSDC Signed</th></tr></thead>
            <tbody>
              {[
                ["NS", "Normal", "Sale", "Yes"],
                ["NR", "Normal", "Refund", "Yes"],
                ["CS", "Copy", "Sale", "Yes (copy)"],
                ["CR", "Copy", "Refund", "Yes (copy)"],
                ["TS", "Training", "Sale", "No"],
                ["TR", "Training", "Refund", "No"],
                ["PS", "Proforma", "Sale", "No"],
              ].map(([l, t, tx, s], i) => (
                <tr key={l} className={i % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                  <td className="p-2 border-b border-neutral-200 font-bold text-blue-700">{l}</td>
                  <td className="p-2 border-b border-neutral-200">{t}</td>
                  <td className="p-2 border-b border-neutral-200">{tx}</td>
                  <td className="p-2 border-b border-neutral-200">{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">Sale Submission Flow</h2>
          <ol className="space-y-2">
            <li>POS sale completed → <code className="bg-neutral-100 px-1 rounded">PosSaleService.processSale()</code></li>
            <li>EBM adapter builds VSDC payload with tax amounts, item list, payment type code</li>
            <li><code className="bg-neutral-100 px-1 rounded">POST {"{vsdc_base_url}"}/trnsSales/saveSales</code> with 5,000ms timeout</li>
            <li>On <code className="bg-neutral-100 px-1 rounded">resultCd: "000"</code> — store <code>rcptNo</code>, <code>intrlData</code>, <code>rcptSign</code>, <code>sdcId</code>, <code>mrcNo</code>, <code>vsdcRcptPbctDate</code></li>
            <li>On timeout/error → enqueue in <code>ebm_queue</code> table; retry with exponential back-off (30s/60s/120s/240s/480s)</li>
            <li>After NS submission → send EJ_DATA journal to VSDC</li>
            <li>After NS submission → send stock OUT + stock master update to VSDC</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">Tax Computation</h2>
          <p>Tax amounts use RRA's extraction formula (VAT is inclusive in the selling price):</p>
          <pre className="mt-2 bg-neutral-900 text-green-400 p-3 rounded-lg text-xs">{`// Tax Class B (18% VAT) — extracted from tax-inclusive price
taxAmtB = round(lineTotal × 18 / 118, 2)

// Rounding adjustment applied to last line if total drift > 0.01
// to ensure sum(taxAmtB per line) == totTaxAmt

// Tax Classes A, C, D = 0% (zero-rated or exempt)
taxAmtA = taxAmtC = taxAmtD = 0`}</pre>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">QR Code Format</h2>
          <pre className="bg-neutral-900 text-green-400 p-3 rounded-lg text-xs">{`{ddmmyyyy}#{hhmmss}#{sdcId}#{rcptNo}#{intrlData}#{rcptSign}

Example:
25052012#110735#SDC001000001#168/258#TE68-SLA2-34J5-EAV3#V249-J39C`}</pre>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">Offline Queue</h2>
          <ul className="space-y-2">
            <li>If VSDC unreachable (timeout, connection refused, network error) → sale enqueued in <code className="bg-neutral-100 px-1 rounded">ebm_queue</code> DB table</li>
            <li>Retry schedule: 30s → 60s → 120s → 240s → 480s (5 attempts)</li>
            <li>After 5 failures → critical alert to pharmacy administrator</li>
            <li>VSDC health checked every 60 seconds while shift is open</li>
            <li>On VSDC recovery → queue drained automatically within 60 seconds</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">Z-Report (Shift Close)</h2>
          <ul className="space-y-2">
            <li>Automatically submitted when a cashier closes their shift</li>
            <li>Payload includes: TIN, branch ID, shift date, NS total, NR total, tax-class breakdown (A/B/C/D)</li>
            <li>Each shift can only have one Z-Report (duplicate attempts return HTTP 409)</li>
            <li>Z-Report failure does NOT block the shift from closing; alert is created for administrator</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-3">VSDC Error Codes</h2>
          <table className="w-full border-collapse text-xs">
            <thead><tr className="bg-neutral-900 text-white"><th className="p-2 text-left">Code</th><th className="p-2 text-left">Meaning</th><th className="p-2 text-left">Action</th></tr></thead>
            <tbody>
              {[
                ["000", "Success", "Proceed normally"],
                ["40", "VSDC not activated", "Contact VSDC vendor to activate device"],
                ["32", "Wrong TIN", "Verify TIN in EBM settings"],
                ["881", "Purchase code mandatory", "Include 6-char prcOrdCd for B2B sales"],
                ["882", "Purchase code invalid", "Verify purchase code with buyer"],
                ["884", "Invalid customer TIN", "Validate via GET /customers/:tin"],
                ["90", "Internet error", "Check VSDC server connectivity"],
                ["99", "Hardware intervention needed", "Contact VSDC vendor"],
              ].map(([c, m, a], i) => (
                <tr key={c} className={i % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                  <td className="p-2 border-b border-neutral-200 font-bold text-red-700">{c}</td>
                  <td className="p-2 border-b border-neutral-200">{m}</td>
                  <td className="p-2 border-b border-neutral-200 text-neutral-600">{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-neutral-200 flex items-center justify-between text-sm text-neutral-500 flex-wrap gap-4">
        <span>Pryrox EBM Integration Guide · Version 1.0</span>
        <Link href="/docs" className="text-blue-600 hover:underline">← All documentation</Link>
      </div>
    </div>
  );
}

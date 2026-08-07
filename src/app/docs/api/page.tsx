import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference — Pryrox Documentation",
  description:
    "Full REST API reference for the Pryrox backend: EBM, POS, inventory, reports, and settings endpoints.",
};

const groups = [
  {
    name: "EBM / VSDC Integration",
    endpoints: [
      { method: "GET", path: "/api/integrations/rra-ebm/settings", desc: "Retrieve current EBM settings" },
      { method: "PUT", path: "/api/integrations/rra-ebm/settings", desc: "Save settings and trigger VSDC device initialization" },
      { method: "POST", path: "/api/integrations/rra-ebm/initialize", desc: "Manually re-initialize the VSDC device" },
      { method: "GET", path: "/api/integrations/rra-ebm/status", desc: "VSDC connectivity status, queue count, last submission" },
      { method: "POST", path: "/api/integrations/rra-ebm/sync-items", desc: "Sync all unsynced medications to VSDC" },
      { method: "GET", path: "/api/integrations/rra-ebm/codes", desc: "Fetch VSDC system codes by category" },
      { method: "GET", path: "/api/integrations/rra-ebm/item-classes", desc: "Fetch UNSPSC item classification codes" },
      { method: "GET", path: "/api/integrations/rra-ebm/customers/:tin", desc: "Validate and retrieve customer info by TIN" },
      { method: "GET", path: "/api/integrations/rra-ebm/notices", desc: "Retrieve RRA notices from VSDC" },
      { method: "POST", path: "/api/integrations/rra-ebm/import-items", desc: "Fetch importation details (with lastReqDt date management)" },
      { method: "POST", path: "/api/integrations/rra-ebm/import-items/status", desc: "Update import item approval/rejection status" },
      { method: "GET", path: "/api/integrations/rra-ebm/purchases", desc: "List unconfirmed VSDC purchase records" },
      { method: "POST", path: "/api/integrations/rra-ebm/purchases/:id/confirm", desc: "Confirm a supplier purchase transaction" },
      { method: "GET", path: "/api/integrations/rra-ebm/x-report", desc: "Get intra-day X-Report from VSDC" },
      { method: "POST", path: "/api/integrations/rra-ebm/fiscal-receipt/:saleId", desc: "Render fiscal receipt data for a sale" },
    ],
  },
  {
    name: "POS",
    endpoints: [
      { method: "GET", path: "/api/pos", desc: "List recent POS sales" },
      { method: "GET", path: "/api/pos/products", desc: "List sellable inventory for a branch" },
      { method: "POST", path: "/api/pos/sale", desc: "Complete a POS sale (NS receipt)" },
      { method: "POST", path: "/api/pos/returns", desc: "Process a return / refund (NR receipt)" },
      { method: "POST", path: "/api/pos/void-sale", desc: "Void a completed sale" },
      { method: "GET", path: "/api/pos/shifts", desc: "Get current cashier shift" },
      { method: "POST", path: "/api/pos/shifts", desc: "Open or close a cashier shift" },
      { method: "POST", path: "/api/pos/training-mode", desc: "Enable or disable POS training mode (TS/TR)" },
      { method: "GET", path: "/api/pos/training-mode", desc: "Get current training mode status" },
      { method: "POST", path: "/api/pos/daily-close", desc: "Close the current POS day" },
    ],
  },
  {
    name: "Reports",
    endpoints: [
      { method: "GET", path: "/api/reports/sales", desc: "Sales report aggregates" },
      { method: "GET", path: "/api/reports/financial", desc: "Financial performance report" },
      { method: "GET", path: "/api/reports/tax", desc: "VAT and tax transaction report" },
      { method: "GET", path: "/api/reports/plu", desc: "PLU report — item quantities sold and remaining stock" },
      { method: "GET", path: "/api/reports/detailed?type=sales|purchases|stock|items|importation", desc: "Detailed report by type" },
      { method: "GET", path: "/api/reports/insurance-claims", desc: "Monthly insurance claims report" },
      { method: "GET", path: "/api/reports/combined", desc: "Combined dashboard data" },
      { method: "GET", path: "/api/reports/audit", desc: "Pharmacy audit log entries" },
    ],
  },
  {
    name: "Inventory",
    endpoints: [
      { method: "GET", path: "/api/inventory", desc: "List inventory rows" },
      { method: "POST", path: "/api/inventory", desc: "Add new medication/inventory batch" },
      { method: "PUT", path: "/api/inventory/:id", desc: "Update inventory item" },
      { method: "DELETE", path: "/api/inventory/:id", desc: "Remove inventory item" },
      { method: "GET", path: "/api/inventory/stock-alerts", desc: "Low-stock and near-expiry alerts" },
    ],
  },
  {
    name: "Settings",
    endpoints: [
      { method: "GET", path: "/api/settings", desc: "Get pharmacy settings" },
      { method: "PUT", path: "/api/settings", desc: "Update pharmacy settings" },
      { method: "GET", path: "/api/pharmacy/profile", desc: "Get pharmacy profile (name, TIN, address)" },
      { method: "PUT", path: "/api/pharmacy/profile", desc: "Update pharmacy profile" },
    ],
  },
];

const methodColor: Record<string, string> = {
  GET: "text-green-700 bg-green-50 border-green-200",
  POST: "text-orange-700 bg-orange-50 border-orange-200",
  PUT: "text-blue-700 bg-blue-50 border-blue-200",
  DELETE: "text-red-700 bg-red-50 border-red-200",
};

export default function ApiPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-6">
        <Link href="/docs" className="text-sm text-blue-600 hover:underline">← Documentation</Link>
      </div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">API Reference</h1>
      <p className="text-neutral-600 mb-8">
        REST API endpoints for the Pryrox backend. All endpoints require session authentication
        unless otherwise noted. Base URL: <code className="bg-neutral-100 px-2 py-0.5 rounded text-sm">https://your-pryrox-server</code>
      </p>

      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.name}>
            <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">
              {group.name}
            </h2>
            <div className="space-y-2">
              {group.endpoints.map((ep) => (
                <div key={ep.path} className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors">
                  <span className={`shrink-0 text-xs font-bold border px-2 py-0.5 rounded font-mono mt-0.5 ${methodColor[ep.method] ?? "text-neutral-700 bg-neutral-50 border-neutral-200"}`}>
                    {ep.method}
                  </span>
                  <div className="min-w-0">
                    <code className="text-sm text-neutral-800 font-mono break-all">{ep.path}</code>
                    <p className="text-xs text-neutral-500 mt-0.5">{ep.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-neutral-200 flex items-center justify-between text-sm text-neutral-500 flex-wrap gap-4">
        <span>Pryrox API Reference · Version 1.0</span>
        <Link href="/docs" className="text-blue-600 hover:underline">← All documentation</Link>
      </div>
    </div>
  );
}

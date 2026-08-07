import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Manual — Pryrox Documentation",
  description:
    "Complete POS user guide: opening shifts, processing sales (NS), refunds (NR), copies (CS/CR), training mode, receipts, Z-reports, and VSDC offline handling.",
};

const sections = [
  { id: "login", title: "1. Logging In" },
  { id: "shift-open", title: "2. Opening a Cashier Shift" },
  { id: "normal-sale", title: "3. Processing a Normal Sale (NS)" },
  { id: "refund", title: "4. Processing a Refund (NR)" },
  { id: "copy", title: "5. Printing a Copy Receipt (CS/CR)" },
  { id: "training", title: "6. Training Mode (TS/TR)" },
  { id: "proforma", title: "7. Proforma Receipts (PS)" },
  { id: "discounts", title: "8. Discounts and Price Adjustments" },
  { id: "insurance", title: "9. Insurance Payments" },
  { id: "receipt", title: "10. Understanding the Fiscal Receipt" },
  { id: "reports", title: "11. X Report and Z Report" },
  { id: "shift-close", title: "12. Closing a Cashier Shift" },
  { id: "offline", title: "13. VSDC Offline — What to Do" },
  { id: "errors", title: "14. Error Messages" },
];

export default function UserManualPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-6">
        <Link href="/docs" className="text-sm text-blue-600 hover:underline">
          ← Documentation
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-neutral-900 mb-2">User Manual</h1>
      <p className="text-neutral-600 mb-8">
        For cashiers and pharmacy managers. Covers daily POS operations, receipt
        types, EBM fiscal receipts, and shift management.
      </p>

      {/* Table of contents */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 mb-10">
        <h2 className="font-semibold text-neutral-900 mb-3">Contents</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="prose prose-neutral max-w-none space-y-10">

        <section id="login">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">1. Logging In</h2>
          <ol className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>Open a web browser and go to your Pryrox URL (provided by your system administrator).</li>
            <li>Enter your email address and password.</li>
            <li>If 2FA is enabled, enter the 6-digit code from your authenticator app.</li>
            <li>Click <strong>POS</strong> in the left sidebar to open the Point of Sale screen.</li>
          </ol>
          <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 text-sm text-amber-800 rounded-r">
            <strong>Important:</strong> Do not share your login credentials. Each cashier must use their own account.
          </div>
        </section>

        <section id="shift-open">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">2. Opening a Cashier Shift</h2>
          <p className="mt-3 text-sm text-neutral-700">You must open a shift before processing any sale. The system blocks transactions if no shift is open.</p>
          <ol className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>In the POS screen, click the <strong>Shift</strong> panel.</li>
            <li>Click <strong>Open Shift</strong>.</li>
            <li>Enter the <strong>Opening Cash</strong> amount in the till.</li>
            <li>Click <strong>Confirm</strong>. The system records the time and cashier.</li>
          </ol>
        </section>

        <section id="normal-sale">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">3. Processing a Normal Sale (NS)</h2>
          <ol className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>Search for the product by name, barcode, or category.</li>
            <li>Click the product to add it to the cart. Adjust quantity if needed.</li>
            <li>The system selects the earliest-expiry batch (FEFO). Acknowledge near-expiry warnings if prompted.</li>
            <li>If a prescription is required, confirm the prescriber and patient name.</li>
            <li>Select the payment method (Cash, Card, Mobile Money, Insurance, or Split).</li>
            <li>Click <strong>Complete Sale</strong>.</li>
            <li>The sale is submitted to the VSDC. The fiscal receipt contains the SDC information block, receipt signature, and QR code.</li>
            <li>Click <strong>Print</strong> to print the receipt.</li>
          </ol>
          <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 text-sm text-amber-800 rounded-r">
            <strong>Important:</strong> If the VSDC does not respond within 5 seconds, the sale is queued. The receipt is marked "EBM pending" and will be updated when the VSDC reconnects.
          </div>
        </section>

        <section id="refund">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">4. Processing a Refund (NR)</h2>
          <ol className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>Click <strong>Returns / Refund</strong> in the POS screen.</li>
            <li>Enter the original receipt number or scan its QR code.</li>
            <li>Select the items to return, quantity, reason, and disposition (restock, damaged, destroy).</li>
            <li>Click <strong>Process Return</strong>. The system issues an NR receipt with negative amounts, referencing the original sale.</li>
          </ol>
          <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 text-sm text-amber-800 rounded-r">
            <strong>Important:</strong> You cannot modify an approved receipt. Always use a refund to correct a transaction.
          </div>
        </section>

        <section id="copy">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">5. Printing a Copy Receipt (CS/CR)</h2>
          <ol className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>Find the original sale in Sales History.</li>
            <li>Click <strong>Print Copy</strong>.</li>
            <li>The system generates a CS or CR receipt with <strong>COPY</strong> printed as a watermark and "THIS IS NOT AN OFFICIAL RECEIPT" below the totals.</li>
          </ol>
        </section>

        <section id="training">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">6. Training Mode (TS/TR)</h2>
          <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 text-sm text-amber-800 rounded-r">
            <strong>Important:</strong> Training mode must be activated using a dedicated button — it cannot be entered accidentally during a normal sale.
          </div>
          <ol className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>Click the <strong>Training Mode</strong> toggle (separate from the normal sale buttons).</li>
            <li>A prominent <strong>TRAINING MODE</strong> banner appears on screen.</li>
            <li>All receipts in this mode are TS/TR and marked "THIS IS NOT AN OFFICIAL RECEIPT". They are NOT submitted to the VSDC.</li>
            <li>Click the toggle again to return to normal sales mode.</li>
          </ol>
        </section>

        <section id="proforma">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">7. Proforma Receipts (PS)</h2>
          <p className="mt-3 text-sm text-neutral-700">A proforma is an advance/quotation receipt. Select <strong>Proforma</strong> as the receipt type before completing the sale. Proforma receipts are NOT submitted to the VSDC.</p>
        </section>

        <section id="discounts">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">8. Discounts and Price Adjustments</h2>
          <p className="mt-3 text-sm text-neutral-700">Click a cart item to apply a discount percentage or fixed amount. Discounts are shown on the receipt as a separate line. All corrections must be made before approving the sale.</p>
        </section>

        <section id="insurance">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">9. Insurance Payments</h2>
          <ol className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>Select <strong>Insurance</strong> as the payment method.</li>
            <li>Choose the provider and enter the patient membership number.</li>
            <li>The system calculates coverage and patient copay. Both amounts appear as separate lines on the receipt.</li>
          </ol>
        </section>

        <section id="receipt">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">10. Understanding the Fiscal Receipt</h2>
          <p className="mt-3 text-sm text-neutral-700">Every normal sale receipt contains an <strong>SDC Information block</strong> required by RRA:</p>
          <table className="mt-3 w-full text-sm border-collapse">
            <thead><tr className="bg-neutral-900 text-white"><th className="p-2 text-left">Field</th><th className="p-2 text-left">Description</th></tr></thead>
            <tbody>
              {[
                ["SDC ID", "VSDC serial number assigned to your pharmacy"],
                ["MRC", "Machine Registration Code — unique POS device identifier"],
                ["Receipt Number", "Sequential VSDC counter, e.g. '168/258 NS'"],
                ["Date/Time", "Authoritative timestamp from the VSDC"],
                ["Internal Data", "Encrypted RRA verification data"],
                ["Receipt Signature", "Cryptographic signature proving receipt authenticity"],
                ["QR Code", "Encodes: date, time, SDC ID, receipt number, internal data, signature"],
              ].map(([f, d], i) => (
                <tr key={f} className={i % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                  <td className="p-2 border-b border-neutral-200 font-medium">{f}</td>
                  <td className="p-2 border-b border-neutral-200 text-neutral-600">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="reports">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">11. X Report and Z Report</h2>
          <div className="mt-3 space-y-3 text-sm text-neutral-700">
            <p><strong>X Report:</strong> Intra-day sales summary since last Z. Can be run anytime. Does not reset counters. Go to <strong>Reports → X Report</strong>.</p>
            <p><strong>Z Report:</strong> Official end-of-day fiscal report sent to the VSDC. <strong>Automatically submitted when you close your shift.</strong> Resets daily counters. Each shift can only have one Z Report.</p>
          </div>
        </section>

        <section id="shift-close">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">12. Closing a Cashier Shift</h2>
          <ol className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>Open the <strong>Shift</strong> panel and click <strong>Close Shift</strong>.</li>
            <li>Count the physical cash and enter the <strong>Actual Cash</strong> amount.</li>
            <li>Click <strong>Confirm Close</strong>. The system submits the Z Report to the VSDC and shows the cash variance.</li>
          </ol>
        </section>

        <section id="offline">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">13. VSDC Offline — What to Do</h2>
          <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 text-sm text-amber-800 rounded-r">
            If you see <em>"EBM offline — receipts queued"</em>, the VSDC is temporarily unreachable.
          </div>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>Continue processing sales normally. All receipts are queued automatically.</li>
            <li>Queued receipts are marked "EBM pending — not yet a valid fiscal document."</li>
            <li>When the VSDC reconnects, all queued receipts are submitted automatically in order.</li>
            <li>If the VSDC is offline for more than 5 minutes, a critical alert is sent to the administrator.</li>
          </ul>
        </section>

        <section id="errors">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">14. Error Messages</h2>
          <table className="mt-3 w-full text-sm border-collapse">
            <thead><tr className="bg-neutral-900 text-white"><th className="p-2 text-left">Error</th><th className="p-2 text-left">Action</th></tr></thead>
            <tbody>
              {[
                ["Open a cashier shift before processing transactions", "Open a shift (Section 2)"],
                ["Insufficient stock", "Check inventory; receive new stock"],
                ["Cannot sell expired batch", "Remove item; mark batch for disposal"],
                ["Prescription confirmation required", "Confirm prescriber name and click Confirm Rx"],
                ["VSDC device is not initialized", "Contact system admin to complete EBM setup"],
                ["EBM submission pending", "Normal — receipt queued (Section 13)"],
                ["Purchase code is mandatory", "Enter the 6-character purchase code from buyer"],
                ["Z-Report already submitted for this shift", "Shift already closed — contact manager"],
              ].map(([e, a], i) => (
                <tr key={e} className={i % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                  <td className="p-2 border-b border-neutral-200 font-medium text-red-700">{e}</td>
                  <td className="p-2 border-b border-neutral-200 text-neutral-600">{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-neutral-200 flex items-center justify-between text-sm text-neutral-500 flex-wrap gap-4">
        <span>Pryrox User Manual · Version 1.0</span>
        <Link href="/docs" className="text-blue-600 hover:underline">← All documentation</Link>
      </div>
    </div>
  );
}

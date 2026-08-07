import {
  pharmacyInitials,
  pharmacyLocationLine,
} from "@/lib/pharmacy/receipt-preview";

export type PosReceiptLine = {
  name: string;
  quantity: number;
  price: number;
};

export type PosReceiptCustomer = {
  name: string;
  phone?: string;
  insuranceType?: string;
  insuranceNumber?: string;
};

export type PosReceiptInput = {
  receiptNumber: string;
  pharmacyName: string;
  pharmacyTin?: string;           // Row 33: TIN in header block
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  pharmacyTagline?: string;
  cashierName: string;
  customer: PosReceiptCustomer;
  patientName?: string;
  items: PosReceiptLine[];
  subtotal: number;
  insuranceCoverage: number;
  patientAmount: number;
  paymentMethod: string;
  footerText?: string;
  // Row 21: software version
  softwareVersion?: string;
  // Row 32: RRA logo flag
  showRraLogo?: boolean;
  // EBM/VSDC fiscal receipt fields (Row 33: SDC info block)
  ebm?: {
    sdcId?: string;
    mrcNo?: string;
    rcptNo?: string;
    intrlData?: string;
    rcptSign?: string;
    vsdcRcptPbctDate?: string;
    qrCode?: string;
    receiptType?: string;         // NS | NR | CS | CR | TS | TR | PS
    ebmStatus?: string;           // submitted | queued | failed | pending
  };
  // Row 18: paper format hint
  printFormat?: 'roll' | 'a5' | 'a4';
  // VAT breakdown for receipt
  vatBreakdown?: {
    taxblAmtB?: number;
    taxAmtB?: number;
    taxblAmtA?: number;
  };
};

export type PrintReceiptResult =
  | { ok: true }
  | { ok: false; error: string };

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildPosReceiptHtml(input: PosReceiptInput): string {
  const {
    receiptNumber,
    pharmacyName,
    pharmacyTin,
    city,
    address,
    phone,
    email,
    licenseNumber,
    pharmacyTagline = "Digital healthcare partner",
    cashierName,
    customer,
    patientName,
    items,
    insuranceCoverage,
    patientAmount,
    paymentMethod,
    footerText,
    softwareVersion,
    showRraLogo = true,
    ebm,
    printFormat = 'roll',
    vatBreakdown,
  } = input;

  const displayName = pharmacyName.trim() || "Pharmacy";
  const initials = pharmacyInitials(displayName);
  const locationLine = pharmacyLocationLine({ name: displayName, city, address });
  const amountDue = patientAmount;
  const showInsurance = insuranceCoverage > 0;
  const showPatient = Boolean(patientName?.trim());

  // Row 18: paper format — max-width adapts per format
  const maxWidth = printFormat === 'a4' ? '794px' : printFormat === 'a5' ? '559px' : '320px';

  // Non-official receipt types (CS, CR, TS, TR, PS)
  const nonOfficialTypes = new Set(['CS', 'CR', 'TS', 'TR', 'PS']);
  const isNonOfficial = ebm?.receiptType ? nonOfficialTypes.has(ebm.receiptType) : false;
  const receiptTypeLabel = ebm?.receiptType ?? 'NS';

  // Row 21: version line
  const versionLine = softwareVersion ? `v${softwareVersion}` : '';

  // Row 32: RRA logo SVG (text-based fallback — real PNG would be loaded from public assets)
  const rraLogoHtml = showRraLogo
    ? `<div class="rra-logo">
         <span class="rra-badge">RRA</span>
         <span class="rra-label">Rwanda Revenue Authority — Certified Receipt</span>
       </div>`
    : '';

  // Row 33: TIN must appear in first block
  const tinLine = pharmacyTin ? `<div>TIN: ${escapeHtml(pharmacyTin)}</div>` : '';

  const lineRows = items
    .map((item) => {
      const lineTotal = item.price * item.quantity;
      const label = item.quantity > 1 ? `${escapeHtml(item.name)} × ${item.quantity}` : escapeHtml(item.name);
      return `<div class="line-row"><span>${label}</span><span>${lineTotal.toLocaleString()} RWF</span></div>`;
    })
    .join("");

  const insuranceRows = showInsurance
    ? `<div class="line-row insurance"><span>Insurance</span><span>−${insuranceCoverage.toLocaleString()} RWF</span></div>
       <div class="line-row"><span>Patient pays</span><span>${amountDue.toLocaleString()} RWF</span></div>`
    : "";

  // VAT breakdown lines (Rows 45–49)
  const vatRows = [
    vatBreakdown?.taxblAmtA != null && vatBreakdown.taxblAmtA > 0
      ? `<div class="line-row vat"><span>TOTAL A-EX</span><span>${vatBreakdown.taxblAmtA.toLocaleString()} RWF</span></div>` : '',
    vatBreakdown?.taxblAmtB != null && vatBreakdown.taxblAmtB > 0
      ? `<div class="line-row vat"><span>TOTAL B-18.00%</span><span>${vatBreakdown.taxblAmtB.toLocaleString()} RWF</span></div>` : '',
    vatBreakdown?.taxAmtB != null && vatBreakdown.taxAmtB > 0
      ? `<div class="line-row vat"><span>TOTAL TAX B</span><span>${vatBreakdown.taxAmtB.toLocaleString()} RWF</span></div>` : '',
  ].filter(Boolean).join('');

  // SDC information block (Row 34: SDC info before last block)
  const sdcBlock = ebm?.sdcId ? `
    <div class="sdc-block">
      <div class="sdc-title">SDC INFORMATION</div>
      ${ebm.vsdcRcptPbctDate ? `<div class="sdc-row"><span>Date:</span><span>${escapeHtml(ebm.vsdcRcptPbctDate)}</span></div>` : ''}
      ${ebm.sdcId ? `<div class="sdc-row"><span>SDC ID:</span><span>${escapeHtml(ebm.sdcId)}</span></div>` : ''}
      ${ebm.mrcNo ? `<div class="sdc-row"><span>MRC:</span><span>${escapeHtml(ebm.mrcNo)}</span></div>` : ''}
      ${ebm.rcptNo ? `<div class="sdc-row"><span>Receipt No:</span><span>${escapeHtml(ebm.rcptNo)} ${escapeHtml(receiptTypeLabel)}</span></div>` : ''}
      ${ebm.intrlData ? `<div class="sdc-row wrap"><span>Internal Data:</span><span>${escapeHtml(ebm.intrlData)}</span></div>` : ''}
      ${ebm.rcptSign ? `<div class="sdc-row wrap"><span>Signature:</span><span>${escapeHtml(ebm.rcptSign)}</span></div>` : ''}
      ${ebm.qrCode ? `<div class="sdc-qr"><span class="qr-label">QR Data:</span><span class="qr-value">${escapeHtml(ebm.qrCode)}</span></div>` : ''}
    </div>` : '';

  // EBM pending disclaimer
  const pendingDisclaimer = ebm && ['queued', 'failed', 'pending'].includes(ebm.ebmStatus ?? '')
    ? `<div class="pending-notice">⚠ EBM submission pending — this receipt is not yet a valid fiscal document.</div>` : '';

  // Non-official notice (Row 55)
  const nonOfficialNotice = isNonOfficial
    ? `<div class="non-official">${escapeHtml(receiptTypeLabel)}</div>
       <div class="non-official-disclaimer">THIS IS NOT AN OFFICIAL RECEIPT</div>` : '';

  const contactRows = [
    phone?.trim() ? `<span>Tel: ${escapeHtml(phone.trim())}</span>` : "",
    email?.trim() ? `<span>${escapeHtml(email.trim())}</span>` : "",
  ].filter(Boolean).join(" · ");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Receipt ${escapeHtml(receiptNumber)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0; padding: 20px;
        font-family: system-ui, -apple-system, Segoe UI, sans-serif;
        font-size: 12px; color: #171717; background: #fff;
      }
      .card { max-width: ${maxWidth}; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; }
      .brand { display: flex; gap: 14px; padding: 20px; background: #fafafa; border-bottom: 1px solid #f0f0f0; }
      .mark { width: 56px; height: 56px; border-radius: 12px; background: #171717; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; }
      .brand h1 { margin: 0; font-size: 18px; line-height: 1.2; }
      .brand p { margin: 4px 0 0; color: #737373; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; }
      .location { margin-top: 8px; color: #525252; font-size: 11px; }
      .body { padding: 16px 20px 20px; }
      .receipt-box { border: 1px solid #f0f0f0; border-radius: 8px; background: #fafafa; padding: 12px; }
      .receipt-head { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; font-weight: 600; }
      .receipt-no { color: #737373; font-weight: 500; }
      .meta { margin-top: 6px; color: #525252; font-size: 10px; line-height: 1.5; }
      .line-row { display: flex; justify-content: space-between; gap: 8px; margin-top: 6px; font-size: 10px; color: #525252; }
      .line-row.insurance { color: #047857; }
      .line-row.vat { color: #525252; font-style: italic; }
      .total-row { display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e5e5; font-size: 10px; font-weight: 700; color: #171717; }
      .contact { margin-top: 12px; color: #525252; font-size: 10px; }
      .footer { margin-top: 12px; text-align: center; color: #737373; font-size: 10px; }
      /* Row 32: RRA logo */
      .rra-logo { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; padding: 6px 10px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; }
      .rra-badge { font-weight: 800; font-size: 11px; color: #856404; letter-spacing: 1px; }
      .rra-label { font-size: 9px; color: #856404; }
      /* Row 21: version */
      .version-line { font-size: 9px; color: #aaa; margin-top: 4px; }
      /* SDC block */
      .sdc-block { margin-top: 10px; padding: 8px; border: 1px dashed #ccc; border-radius: 6px; font-size: 9px; color: #333; }
      .sdc-title { font-weight: 700; font-size: 10px; margin-bottom: 4px; text-align: center; letter-spacing: 0.05em; }
      .sdc-row { display: flex; justify-content: space-between; gap: 6px; margin-top: 2px; }
      .sdc-row.wrap { flex-direction: column; word-break: break-all; }
      .sdc-qr { margin-top: 6px; word-break: break-all; }
      .qr-label { font-weight: 600; display: block; }
      .qr-value { font-size: 8px; color: #555; }
      /* Non-official */
      .non-official { font-size: 16px; font-weight: 900; text-align: center; color: #dc2626; margin: 8px 0 2px; letter-spacing: 2px; }
      .non-official-disclaimer { font-size: 11px; font-weight: 700; text-align: center; color: #dc2626; border: 2px solid #dc2626; padding: 4px; margin: 4px 0; }
      /* Pending EBM notice */
      .pending-notice { font-size: 9px; color: #92400e; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 4px; padding: 4px 8px; margin-top: 6px; text-align: center; }
      @media print {
        body { padding: 0; }
        .card { border: none; border-radius: 0; max-width: none; }
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="brand">
        <div class="mark">${escapeHtml(initials)}</div>
        <div>
          <h1>${escapeHtml(displayName)}</h1>
          <p>${escapeHtml(pharmacyTagline)}</p>
          ${tinLine}
          ${locationLine ? `<div class="location">${escapeHtml(locationLine)}</div>` : ""}
          ${versionLine ? `<div class="version-line">Software: ${escapeHtml(versionLine)}</div>` : ''}
        </div>
      </div>
      <div class="body">
        ${rraLogoHtml}
        ${nonOfficialNotice}
        <div class="receipt-box">
          <div class="receipt-head">
            <span>${escapeHtml(displayName)}</span>
            <span class="receipt-no">${escapeHtml(receiptNumber)}</span>
          </div>
          <div class="meta">
            ${licenseNumber?.trim() ? `<div>Lic. ${escapeHtml(licenseNumber.trim())}</div>` : ""}
            <div>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            <div>Payer: ${escapeHtml(customer.name || "Walk-in customer")}</div>
            ${showPatient ? `<div>Patient: ${escapeHtml(patientName!.trim())}</div>` : ""}
            <div>Cashier: ${escapeHtml(cashierName)}</div>
            <div>Payment: ${escapeHtml(paymentMethod.toUpperCase())}</div>
            ${customer.insuranceType ? `<div>Insurance: ${escapeHtml(customer.insuranceType)}</div>` : ""}
            ${customer.phone ? `<div>Client Tel: ${escapeHtml(customer.phone)}</div>` : ''}
          </div>
          ${lineRows}
          ${vatRows}
          ${insuranceRows}
          <div class="total-row">
            <span>Total</span>
            <span>${amountDue.toLocaleString()} RWF</span>
          </div>
        </div>
        ${sdcBlock}
        ${pendingDisclaimer}
        ${contactRows ? `<div class="contact">${contactRows}</div>` : ""}
        <div class="footer">
          ${footerText ? `<p>${escapeHtml(footerText)}</p>` : "<p>Thank you for your business</p>"}
          <p>Powered by Pryrox</p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

/**
 * Opens the browser print dialog for a POS receipt.
 * Uses a hidden iframe (popup blockers often block window.open after async work).
 */
export function printPosReceipt(input: PosReceiptInput): Promise<PrintReceiptResult> {
  if (typeof window === "undefined") {
    return Promise.resolve({ ok: false, error: "Print is only available in the browser" });
  }

  const html = buildPosReceiptHtml(input);

  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    let settled = false;
    const finish = (result: PrintReceiptResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(fallbackTimer);
      window.setTimeout(() => {
        iframe.remove();
      }, 1000);
      resolve(result);
    };

    const win = iframe.contentWindow;
    const doc = win?.document;
    if (!win || !doc) {
      iframe.remove();
      finish({ ok: false, error: "Could not create print frame" });
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      finish({ ok: true });
    }, 60_000);

    win.onafterprint = () => {
      finish({ ok: true });
    };

    try {
      doc.open();
      doc.write(html);
      doc.close();

      window.requestAnimationFrame(() => {
        try {
          win.focus();
          win.print();
        } catch (err) {
          finish({
            ok: false,
            error: err instanceof Error ? err.message : "Print failed",
          });
        }
      });
    } catch (err) {
      finish({
        ok: false,
        error: err instanceof Error ? err.message : "Could not render receipt",
      });
    }
  });
}

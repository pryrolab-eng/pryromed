export type AdminBillingPaymentRow = {
  id: string;
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_email: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_provider: string | null;
  customer_email: string | null;
  customer_name: string | null;
  catalog_plan_name: string | null;
  created_at: string;
  completed_at: string | null;
};

export type AdminBillingPharmacyRow = {
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_email: string | null;
  access_status: string;
  main_plan_name: string | null;
  main_billing_status: string | null;
  pending_plan_name: string | null;
  branch_addons_active: number;
  expires_at: string | null;
};

export type AdminBillingSummary = {
  completed_count: number;
  pending_count: number;
  failed_count: number;
  volume_by_currency: Record<string, number>;
  platform_currency: string;
};

export type AdminBillingReconciliationRow = {
  id: string;
  kind: "orphan_payment" | "pending_main" | "missing_plan_id";
  pharmacy_id: string | null;
  pharmacy_name: string | null;
  detail: string;
  payment_transaction_id?: string | null;
  subscription_id?: string | null;
  can_cancel: boolean;
};

export type AdminBillingPayload = {
  summary: AdminBillingSummary;
  payments: AdminBillingPaymentRow[];
  pharmacies: AdminBillingPharmacyRow[];
  reconciliation: AdminBillingReconciliationRow[];
};

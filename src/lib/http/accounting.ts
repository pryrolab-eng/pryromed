import { ensureApiSuccess, fetchJson } from "./client";

export const accountingKeys = {
  all: ["accounting"] as const,
  summary: () => [...accountingKeys.all, "summary"] as const,
  expenses: (from?: string, to?: string) =>
    [...accountingKeys.all, "expenses", from ?? "", to ?? ""] as const,
};

export type AccountingMonthlyBreakdown = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  expenseSource: string;
};

export type AccountingCategoryBreakdown = {
  category: string;
  amount: number;
  source: string;
};

export type AccountingPaymentSummary = {
  completedPayments: number;
  completedTransactions: number;
  outstandingInvoices: number;
};

export type AccountingCashFlow = {
  inflow: number;
  outflow: number;
  net: number;
};

export type AccountingSummary = {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  monthlyBreakdown: AccountingMonthlyBreakdown[];
  expenseCategories: AccountingCategoryBreakdown[];
  sources: Record<string, string>;
  paymentSummary: AccountingPaymentSummary;
  cashFlow: AccountingCashFlow;
};

export type AccountingExpenseRow = {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  expenseDate: string | null;
  source: string;
};

export type AccountingExpensesResponse = {
  expenses: AccountingExpenseRow[];
};

export type CreateAccountingExpenseInput = {
  category: string;
  amount: number;
  description?: string;
  expenseDate?: string;
};

export type CreateAccountingExpenseResult = {
  success: boolean;
  expense: AccountingExpenseRow;
};

export async function getAccountingSummary(): Promise<AccountingSummary> {
  return fetchJson<AccountingSummary>("/api/accounting");
}

export async function getAccountingExpenses(
  from?: string,
  to?: string,
): Promise<AccountingExpensesResponse> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return fetchJson<AccountingExpensesResponse>(
    `/api/accounting/expenses${query ? `?${query}` : ""}`,
  );
}

export async function createAccountingExpense(
  body: CreateAccountingExpenseInput,
): Promise<CreateAccountingExpenseResult> {
  const data = await fetchJson<CreateAccountingExpenseResult>(
    "/api/accounting/expenses",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  ensureApiSuccess(data, "Failed to create expense");
  return data;
}

export async function deleteAccountingExpense(
  id: string,
): Promise<{ success: boolean }> {
  return fetchJson<{ success: boolean }>(
    `/api/accounting/expenses/${id}`,
    { method: "DELETE" },
  );
}

/**
 * Page context utilities for the AI chat panel.
 * Provides structured data about the current page to give the AI assistant
 * relevant context when answering questions.
 *
 * PageContext must match AiPageContext in pharmacy-runtime-provider.tsx.
 */

const MAX_CONTEXT_CHARS = 4000;

export type PageContext = {
  version: 1;
  capturedAt: number;
  /** URL path e.g. "/pharmacy/dashboard" */
  route: string;
  /** Page identifier e.g. "pharmacy_dashboard", "pos", "inventory" */
  page: string;
  /** Primary entity being viewed e.g. "dashboard", "inventory", "sale" */
  entity: string;
  filters?: Record<string, unknown>;
  selected?: { id: string; label: string };
  summary?: Record<string, number>;
  capabilities?: string[];
  suggestedActions?: { label: string; toolHint: string }[];
};

/** Trim a context object so it doesn't exceed the token budget. */
export function capAiPageContext(ctx: PageContext): PageContext {
  try {
    const raw = JSON.stringify(ctx);
    if (raw.length <= MAX_CONTEXT_CHARS) return ctx;
    return {
      ...ctx,
      summary: ctx.summary
        ? Object.fromEntries(Object.entries(ctx.summary).slice(0, 10))
        : undefined,
      suggestedActions: ctx.suggestedActions?.slice(0, 3),
    };
  } catch {
    return ctx;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function base(
  page: string,
  route: string,
  entity: string,
  input: {
    filters?: Record<string, unknown>;
    selected?: { id: string; label: string };
    summary?: Record<string, number>;
    capabilities?: string[];
    suggestedActions?: { label: string; toolHint: string }[];
  },
): PageContext {
  return {
    version: 1,
    capturedAt: Date.now(),
    page,
    route,
    entity,
    ...input,
  };
}

// ── Page context builders ────────────────────────────────────────────────────

export function createPharmacyDashboardPageContext(input: {
  page?: string;
  route?: string;
  entity?: string;
  summary?: Record<string, number>;
  filters?: Record<string, unknown>;
  suggestedActions?: { label: string; toolHint: string }[];
}): PageContext {
  return base(
    input.page ?? "pharmacy_dashboard",
    input.route ?? "/pharmacy/dashboard",
    input.entity ?? "dashboard",
    input,
  );
}

export function createPosPageContext(input: {
  page?: string;
  route?: string;
  entity?: string;
  summary?: Record<string, number>;
  filters?: Record<string, unknown>;
  suggestedActions?: { label: string; toolHint: string }[];
}): PageContext {
  return base(
    input.page ?? "pos",
    input.route ?? "/pharmacy/pos",
    input.entity ?? "sale",
    input,
  );
}

export function createInventoryPageContext(input: {
  page?: string;
  route?: string;
  entity?: string;
  summary?: Record<string, number>;
  filters?: Record<string, unknown>;
  suggestedActions?: { label: string; toolHint: string }[];
}): PageContext {
  return base(
    input.page ?? "inventory",
    input.route ?? "/pharmacy/inventory",
    input.entity ?? "inventory",
    input,
  );
}

export function createAdminPageContext(input: {
  page?: string;
  route?: string;
  entity?: string;
  summary?: Record<string, number>;
  filters?: Record<string, unknown>;
  suggestedActions?: { label: string; toolHint: string }[];
}): PageContext {
  return base(
    input.page ?? "admin_dashboard",
    input.route ?? "/admin",
    input.entity ?? "dashboard",
    input,
  );
}

export type DynamicPageContextResult = {
  pageContext: PageContext;
  description: string;
  defaultSuggestions: string[];
};

export function getDynamicPageContextForRoute(pathname: string): DynamicPageContextResult {
  const normalized = pathname.split("?")[0].replace(/\/$/, "") || "/";
  const isAdmin = normalized.startsWith("/admin");

  if (isAdmin) {
    if (normalized === "/admin" || normalized === "/superadmin") {
      return {
        pageContext: createAdminPageContext({
          page: "admin_dashboard",
          route: "/admin",
          entity: "dashboard",
          suggestedActions: [
            { label: "Show platform revenue summary", toolHint: "revenue" },
            { label: "List active pharmacy stores", toolHint: "stores" },
            { label: "Check subscription plan usage", toolHint: "plans" },
            { label: "View platform health metrics", toolHint: "metrics" },
          ],
        }),
        description: "Ask me anything about platform administration, tenants, and metrics.",
        defaultSuggestions: [
          "Show platform revenue summary",
          "List active pharmacy stores",
          "Check subscription plan usage",
          "View platform health metrics",
        ],
      };
    }

    if (normalized.startsWith("/admin/stores")) {
      return {
        pageContext: createAdminPageContext({
          page: "admin_stores",
          route: "/admin/stores",
          entity: "store",
          suggestedActions: [
            { label: "Search pharmacy store by name", toolHint: "search_stores" },
            { label: "List pharmacies on Pro plan", toolHint: "pro_stores" },
            { label: "Check inactive pharmacy accounts", toolHint: "inactive_stores" },
            { label: "Show store subscription statuses", toolHint: "store_subscriptions" },
          ],
        }),
        description: "Ask me anything about tenant pharmacies, stores, and account status.",
        defaultSuggestions: [
          "Search pharmacy store by name",
          "List pharmacies on Pro plan",
          "Check inactive pharmacy accounts",
          "Show store subscription statuses",
        ],
      };
    }

    if (normalized.startsWith("/admin/subscriptions")) {
      return {
        pageContext: createAdminPageContext({
          page: "admin_subscriptions",
          route: "/admin/subscriptions",
          entity: "subscription",
          suggestedActions: [
            { label: "Show active subscription breakdown", toolHint: "subscriptions" },
            { label: "List expiring tenant subscriptions", toolHint: "expiring" },
            { label: "Check plan feature flags", toolHint: "features" },
            { label: "Compare monthly vs yearly revenue", toolHint: "revenue_plans" },
          ],
        }),
        description: "Ask me anything about SaaS subscriptions, plan features, and pricing.",
        defaultSuggestions: [
          "Show active subscription breakdown",
          "List expiring tenant subscriptions",
          "Check plan feature flags",
          "Compare monthly vs yearly revenue",
        ],
      };
    }

    if (normalized.startsWith("/admin/features")) {
      return {
        pageContext: createAdminPageContext({
          page: "admin_features",
          route: "/admin/features",
          entity: "feature",
          suggestedActions: [
            { label: "List feature flags per plan", toolHint: "feature_flags" },
            { label: "Check module entitlements", toolHint: "entitlements" },
            { label: "Show feature allocation matrix", toolHint: "matrix" },
          ],
        }),
        description: "Ask me anything about platform feature flags and entitlements.",
        defaultSuggestions: [
          "List feature flags per plan",
          "Check module entitlements",
          "Show feature allocation matrix",
        ],
      };
    }

    if (normalized.startsWith("/admin/billing")) {
      return {
        pageContext: createAdminPageContext({
          page: "admin_billing",
          route: "/admin/billing",
          entity: "billing",
          suggestedActions: [
            { label: "Show recent platform invoices", toolHint: "invoices" },
            { label: "Calculate monthly recurring revenue", toolHint: "mrr" },
            { label: "Check failed payment transactions", toolHint: "failed_payments" },
          ],
        }),
        description: "Ask me anything about platform billing, transactions, and revenue.",
        defaultSuggestions: [
          "Show recent platform invoices",
          "Calculate monthly recurring revenue",
          "Check failed payment transactions",
        ],
      };
    }

    if (normalized.startsWith("/admin/reports")) {
      return {
        pageContext: createAdminPageContext({
          page: "admin_reports",
          route: "/admin/reports",
          entity: "report",
          suggestedActions: [
            { label: "Summarize total tenant growth", toolHint: "growth" },
            { label: "Show monthly revenue trends", toolHint: "revenue_trends" },
            { label: "Export platform audit summary", toolHint: "export" },
          ],
        }),
        description: "Ask me anything about platform analytics, growth trends, and exports.",
        defaultSuggestions: [
          "Summarize total tenant growth",
          "Show monthly revenue trends",
          "Export platform audit summary",
        ],
      };
    }

    if (normalized.startsWith("/admin/ai-trace-events")) {
      return {
        pageContext: createAdminPageContext({
          page: "admin_ai_trace_events",
          route: "/admin/ai-trace-events",
          entity: "ai_log",
          suggestedActions: [
            { label: "Show recent AI safety trace logs", toolHint: "ai_traces" },
            { label: "Check drug interaction safety queries", toolHint: "safety_queries" },
          ],
        }),
        description: "Ask me anything about AI audit logs, safety traces, and usage.",
        defaultSuggestions: [
          "Show recent AI safety trace logs",
          "Check drug interaction safety queries",
        ],
      };
    }

    if (normalized.startsWith("/admin/settings/notifications") || normalized.includes("notifications")) {
      return {
        pageContext: createAdminPageContext({
          page: "admin_notifications",
          route: "/admin/settings/notifications",
          entity: "email_template",
          suggestedActions: [
            { label: "List all email templates", toolHint: "list_email_templates" },
            { label: "Update the staff invitation template", toolHint: "update_email_template" },
            { label: "Draft a platform maintenance notice", toolHint: "draft_email" },
            { label: "Show the password reset template", toolHint: "get_email_template" },
          ],
        }),
        description: "I can manage email templates, design email content, and draft emails for you to send.",
        defaultSuggestions: [
          "List all email templates",
          "Update the staff invitation template",
          "Draft a platform maintenance notice",
          "Show the password reset template",
        ],
      };
    }

    if (normalized.startsWith("/admin/settings")) {
      return {
        pageContext: createAdminPageContext({
          page: "admin_settings",
          route: "/admin/settings",
          entity: "setting",
          suggestedActions: [
            { label: "Update my display name", toolHint: "update_user_profile" },
            { label: "Toggle maintenance mode", toolHint: "update_platform_settings" },
            { label: "Check IP whitelist configuration", toolHint: "ip_whitelist" },
            { label: "Show platform security settings", toolHint: "security" },
          ],
        }),
        description: "Ask me anything about platform configuration, security, and settings.",
        defaultSuggestions: [
          "Update my display name",
          "Toggle maintenance mode",
          "Check IP whitelist configuration",
          "Show platform security settings",
        ],
      };
    }

    return {
      pageContext: createAdminPageContext({
        page: "admin_general",
        route: normalized,
        entity: "admin",
        suggestedActions: [
          { label: "Show platform revenue summary", toolHint: "revenue" },
          { label: "List active pharmacy stores", toolHint: "stores" },
          { label: "Check system health and status", toolHint: "status" },
        ],
      }),
      description: "Ask me anything about platform administration and tenant management.",
      defaultSuggestions: [
        "Show platform revenue summary",
        "List active pharmacy stores",
        "Check system health and status",
      ],
    };
  }

  // Pharmacy Scope (/pharmacy/*)
  if (normalized.startsWith("/pharmacy/pos")) {
    return {
      pageContext: createPosPageContext({
        suggestedActions: [
          { label: "Look up medicine price & stock", toolHint: "medicine_search" },
          { label: "Check drug interaction risks", toolHint: "interactions" },
          { label: "Search customer for POS checkout", toolHint: "customer_lookup" },
          { label: "Apply insurance discount", toolHint: "insurance" },
        ],
      }),
      description: "Ask me anything about point of sale, medicine pricing, and checkout.",
      defaultSuggestions: [
        "Look up medicine price & stock",
        "Check drug interaction risks",
        "Search customer for POS checkout",
        "Apply insurance discount",
      ],
    };
  }

  if (normalized.startsWith("/pharmacy/patients")) {
    return {
      pageContext: base("patients", "/pharmacy/patients", "patient", {
        suggestedActions: [
          { label: "Search patient by phone or name", toolHint: "patient_search" },
          { label: "List patients with documented allergies", toolHint: "allergies" },
          { label: "Check recent patient visits", toolHint: "recent_visits" },
          { label: "Show active patient profiles", toolHint: "active_patients" },
        ],
      }),
      description: "Ask me anything about patient profiles, allergies, and visit history.",
      defaultSuggestions: [
        "Search patient by phone or name",
        "List patients with documented allergies",
        "Check recent patient visits",
        "Show active patient profiles",
      ],
    };
  }

  if (normalized.startsWith("/pharmacy/prescriptions")) {
    return {
      pageContext: base("prescriptions", "/pharmacy/prescriptions", "prescription", {
        suggestedActions: [
          { label: "Show pending prescriptions", toolHint: "pending_rx" },
          { label: "Check doctor prescription history", toolHint: "doctor_history" },
          { label: "Verify prescription dosage safety", toolHint: "dosage_check" },
          { label: "List fulfilled prescriptions", toolHint: "fulfilled_rx" },
        ],
      }),
      description: "Ask me anything about prescriptions, doctor orders, and dispensing safety.",
      defaultSuggestions: [
        "Show pending prescriptions",
        "Check doctor prescription history",
        "Verify prescription dosage safety",
        "List fulfilled prescriptions",
      ],
    };
  }

  if (normalized.startsWith("/pharmacy/inventory")) {
    return {
      pageContext: createInventoryPageContext({
        suggestedActions: [
          { label: "Check items nearing expiration", toolHint: "expiry" },
          { label: "Show low stock alerts", toolHint: "low_stock" },
          { label: "List stock valuations by category", toolHint: "valuation" },
          { label: "Check insurance medicine coverage", toolHint: "insurance_coverage" },
        ],
      }),
      description: "Ask me anything about medication stock, low inventory, and expiration dates.",
      defaultSuggestions: [
        "Check items nearing expiration",
        "Show low stock alerts",
        "List stock valuations by category",
        "Check insurance medicine coverage",
      ],
    };
  }

  if (normalized.startsWith("/pharmacy/sales")) {
    return {
      pageContext: base("sales", "/pharmacy/sales", "sale", {
        suggestedActions: [
          { label: "Show today's sales breakdown", toolHint: "today_sales" },
          { label: "Find sale transaction by receipt ID", toolHint: "receipt_search" },
          { label: "Compare payment methods (cash/card/momo)", toolHint: "payment_methods" },
          { label: "Calculate gross profit margins", toolHint: "profit_margins" },
        ],
      }),
      description: "Ask me anything about sales history, payment methods, and revenue.",
      defaultSuggestions: [
        "Show today's sales breakdown",
        "Find sale transaction by receipt ID",
        "Compare payment methods (cash/card/momo)",
        "Calculate gross profit margins",
      ],
    };
  }

  if (normalized.startsWith("/pharmacy/customers")) {
    return {
      pageContext: base("customers", "/pharmacy/customers", "customer", {
        suggestedActions: [
          { label: "List top purchasing customers", toolHint: "top_customers" },
          { label: "Search customer contact info", toolHint: "search_customer" },
          { label: "Check total customer credit & balance", toolHint: "customer_balances" },
        ],
      }),
      description: "Ask me anything about customer profiles, purchase history, and balances.",
      defaultSuggestions: [
        "List top purchasing customers",
        "Search customer contact info",
        "Check total customer credit & balance",
      ],
    };
  }

  if (normalized.startsWith("/pharmacy/reports")) {
    return {
      pageContext: base("reports", "/pharmacy/reports", "report", {
        suggestedActions: [
          { label: "Show monthly revenue report", toolHint: "revenue_report" },
          { label: "Analyze top performing products", toolHint: "top_products" },
          { label: "Export financial summary report", toolHint: "export_report" },
        ],
      }),
      description: "Ask me anything about pharmacy analytics, sales trends, and financial reports.",
      defaultSuggestions: [
        "Show monthly revenue report",
        "Analyze top performing products",
        "Export financial summary report",
      ],
    };
  }

  if (normalized.startsWith("/pharmacy/branches")) {
    return {
      pageContext: base("branches", "/pharmacy/branches", "branch", {
        suggestedActions: [
          { label: "Compare branch sales performance", toolHint: "branch_sales" },
          { label: "Check branch stock levels", toolHint: "branch_stock" },
          { label: "List active branch locations", toolHint: "branch_list" },
        ],
      }),
      description: "Ask me anything about branch management, multi-branch stock, and performance.",
      defaultSuggestions: [
        "Compare branch sales performance",
        "Check branch stock levels",
        "List active branch locations",
      ],
    };
  }

  if (normalized.startsWith("/pharmacy/staff")) {
    return {
      pageContext: base("staff", "/pharmacy/staff", "staff", {
        suggestedActions: [
          { label: "List staff branch assignments", toolHint: "staff_branches" },
          { label: "Check cashier shift history", toolHint: "shifts" },
          { label: "Manage staff permissions", toolHint: "permissions" },
        ],
      }),
      description: "Ask me anything about pharmacy staff, cashier shifts, and role permissions.",
      defaultSuggestions: [
        "List staff branch assignments",
        "Check cashier shift history",
        "Manage staff permissions",
      ],
    };
  }

  if (normalized.startsWith("/pharmacy/settings")) {
    return {
      pageContext: base("settings", "/pharmacy/settings", "setting", {
        suggestedActions: [
          { label: "Check security & IP allowlist settings", toolHint: "ip_allowlist" },
          { label: "Configure receipt printed details", toolHint: "receipt_settings" },
          { label: "Manage pharmacy profile", toolHint: "pharmacy_profile" },
        ],
      }),
      description: "Ask me anything about pharmacy configuration, security, and preferences.",
      defaultSuggestions: [
        "Check security & IP allowlist settings",
        "Configure receipt printed details",
        "Manage pharmacy profile",
      ],
    };
  }

  if (normalized.startsWith("/pharmacy/billing")) {
    return {
      pageContext: base("billing", "/pharmacy/billing", "billing", {
        suggestedActions: [
          { label: "Check current plan limits", toolHint: "plan_limits" },
          { label: "View active branch add-ons", toolHint: "addons" },
          { label: "Check next billing cycle date", toolHint: "billing_date" },
        ],
      }),
      description: "Ask me anything about your subscription plan, branch add-ons, and billing.",
      defaultSuggestions: [
        "Check current plan limits",
        "View active branch add-ons",
        "Check next billing cycle date",
      ],
    };
  }

  return {
    pageContext: createPharmacyDashboardPageContext({
      suggestedActions: [
        { label: "Check low stock items", toolHint: "low_stock" },
        { label: "Show sales this week", toolHint: "sales_week" },
        { label: "Look up patient by name", toolHint: "patient_lookup" },
        { label: "What are my top selling products?", toolHint: "top_products" },
      ],
    }),
    description: "Ask me anything about your pharmacy operations.",
    defaultSuggestions: [
      "Check low stock items",
      "Show sales this week",
      "Look up patient by name",
      "What are my top selling products?",
    ],
  };
}

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

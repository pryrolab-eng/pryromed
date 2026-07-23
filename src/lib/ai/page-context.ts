/**
 * Page context utilities for the AI chat panel.
 * Provides structured data about the current page to give the AI assistant
 * relevant context when answering questions.
 */

const MAX_CONTEXT_CHARS = 4000;

export type PageContext = {
  /** Page identifier e.g. "pharmacy_dashboard", "pos", "inventory" */
  page: string;
  /** URL path */
  route: string;
  /** Human-readable summary of what's on screen */
  summary: Record<string, unknown>;
  /** Optional additional structured data */
  data?: Record<string, unknown>;
};

/** Trim a context object so it doesn't exceed the token budget. */
export function capAiPageContext(ctx: PageContext): PageContext {
  try {
    const raw = JSON.stringify(ctx);
    if (raw.length <= MAX_CONTEXT_CHARS) return ctx;
    // Trim summary values to stay under limit
    const trimmed: PageContext = {
      ...ctx,
      summary: Object.fromEntries(
        Object.entries(ctx.summary).slice(0, 10),
      ),
      data: undefined,
    };
    return trimmed;
  } catch {
    return ctx;
  }
}

// ── Page context builders ────────────────────────────────────────────────────

export function createPharmacyDashboardPageContext(input: {
  page?: string;
  route?: string;
  summary: Record<string, unknown>;
  data?: Record<string, unknown>;
}): PageContext {
  return {
    page: input.page ?? "pharmacy_dashboard",
    route: input.route ?? "/pharmacy/dashboard",
    summary: input.summary,
    data: input.data,
  };
}

export function createPosPageContext(input: {
  page?: string;
  route?: string;
  summary: Record<string, unknown>;
  data?: Record<string, unknown>;
}): PageContext {
  return {
    page: input.page ?? "pos",
    route: input.route ?? "/pharmacy/pos",
    summary: input.summary,
    data: input.data,
  };
}

export function createInventoryPageContext(input: {
  page?: string;
  route?: string;
  summary: Record<string, unknown>;
  data?: Record<string, unknown>;
}): PageContext {
  return {
    page: input.page ?? "inventory",
    route: input.route ?? "/pharmacy/inventory",
    summary: input.summary,
    data: input.data,
  };
}

export function createAdminPageContext(input: {
  page?: string;
  route?: string;
  summary: Record<string, unknown>;
  data?: Record<string, unknown>;
}): PageContext {
  return {
    page: input.page ?? "admin_dashboard",
    route: input.route ?? "/admin",
    summary: input.summary,
    data: input.data,
  };
}

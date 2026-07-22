# Pryro Pharmacy — Frontend

Next.js 16 frontend for the Pryro Pharmacy management platform. All business logic lives in the NestJS backend (`../backend`). The frontend handles UI, routing, session cookie auth flows, and proxies every `/api/*` request to the backend via `NEXT_PUBLIC_API_URL`.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Webpack mode) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + tailwindcss-animate |
| UI components | shadcn/ui (Radix UI primitives) |
| State / data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Tables | TanStack Table v8 |
| Animations | Framer Motion / Motion |
| Notifications | Sonner (toast) |
| Real-time | Socket.io client + SSE fallback |
| AI chat | assistant-ui |
| PDF / print | jsPDF + jsPDF-autotable |
| Canvas | Konva / react-konva |
| Queue worker | BullMQ (maintenance notification worker) |
| Auth | HttpOnly JWT cookie (`pryrox_session`) — written by Next.js route handlers, verified by backend |

---

## Prerequisites

- Node 20+
- The NestJS backend running at `http://localhost:4000` (or set `NEXT_PUBLIC_API_URL`)
- Redis (for middleware rate limiting — `pryrox-redis` Docker container locally)

---

## Quick start

```bash
cd frontend
cp .env.example .env        # fill in your values
npm install
npm run dev                 # starts on http://localhost:3000
```

To run frontend + backend together:

```bash
npm run dev:stack           # concurrently starts Next.js (port 3000) + NestJS (port 4000)
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase pooler URL — used only by the 8 remaining Next.js auth/session route handlers |
| `DIRECT_URL` | ✅ | Supabase direct URL — same scope as above |
| `AUTH_SECRET` | ✅ | Min 32-char secret — **must match backend** — used to sign/verify `pryrox_session` cookie |
| `NATIVE_AUTH_ENABLED` | — | Enable email/password auth (default `true`) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Frontend base URL e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | ✅ | NestJS backend URL e.g. `http://localhost:4000` — all migrated API routes point here |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID (for Google sign-in route handler) |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth client secret |
| `ENTITLEMENTS_ENFORCE` | — | `true` to enforce feature gates per subscription plan |
| `NEXT_PUBLIC_NAV_ENTITLEMENT_MODE` | — | `hide` or `lock` — how locked nav items are displayed |
| `REDIS_URL` | — | Redis URL for middleware rate limiting |
| `NEXT_PUBLIC_PLATFORM_CURRENCY` | — | Currency code displayed in UI (default `RWF`) |
| `NODE_ENV` | — | `development` or `production` |

> **Note:** `AUTH_SECRET` must be identical in both frontend and backend `.env` files. Both sides sign and verify the same session JWTs.

---

## NPM scripts

| Script | Description |
|---|---|
| `npm run dev` | Development server on `http://localhost:3000` (Webpack) |
| `npm run dev:turbo` | Development server with Turbopack (experimental) |
| `npm run build` | Production build |
| `npm run start` | Start production server (requires `build` first) |
| `npm run lint` | ESLint |
| `npm run worker` | Start BullMQ maintenance notification worker |
| `npm run dev:stack` | Run Next.js + NestJS backend concurrently |

---

## Project structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (auth)/            # Sign-in, sign-up, reset password pages
│   │   ├── (dashboard)/
│   │   │   ├── pharmacy/      # Pharmacy owner dashboard (POS, inventory, staff, billing…)
│   │   │   └── admin/         # Platform admin dashboard
│   │   ├── api/               # 8 remaining Next.js route handlers (auth cookie writers)
│   │   │   └── auth/          # sign-out, refresh, confirm-email, 2FA, Google OAuth
│   │   └── onboarding/        # New pharmacy setup flow
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components (Button, Input, Dialog…)
│   │   ├── dashboard/         # Shared dashboard primitives (DashboardButton, StatCard…)
│   │   ├── pos/               # POS workspace, cart, shift panel, receipt
│   │   ├── staff/             # Staff list, detail sheet, branch access editor
│   │   ├── inventory/         # Inventory table, batch editor
│   │   ├── insurance/         # Insurance selector, claim processing dialog
│   │   ├── billing/           # Billing page, plan cards, invoice list
│   │   ├── subscription/      # Feature gates, plan management, branch add-ons
│   │   ├── settings/          # Settings panels (general, integrations, analytics…)
│   │   ├── admin/             # Admin panels (pharmacies, plans, system settings…)
│   │   ├── shell/             # Dashboard shell, header bar, branch switcher
│   │   ├── auth/              # Auth forms, app entry gate
│   │   ├── notifications/     # Notification bell, stream hook
│   │   └── assistant-ui/      # AI chat runtime provider
│   │
│   ├── hooks/                 # TanStack Query hooks (one file per domain)
│   │   ├── usePos.ts          # POS products, cart, sale mutations
│   │   ├── useInventory.ts    # Inventory queries and mutations
│   │   ├── useUsers.ts        # Staff + branch access queries
│   │   ├── useSaasSubscription.ts  # Billing, plans, invoices
│   │   ├── usePharmacyEntitlements.ts  # Feature gate state
│   │   ├── useMeContext.ts    # Current user context (role, permissions)
│   │   ├── useNotificationStream.ts   # SSE notification stream
│   │   └── ...                # One hook file per domain
│   │
│   ├── lib/
│   │   ├── http/              # Typed fetch functions — one file per backend domain
│   │   │   ├── client.ts      # Base fetchJson wrapper (resolves NEXT_PUBLIC_API_URL)
│   │   │   ├── migrated-api-prefixes.ts  # resolveApiUrl() — routes to backend vs Next.js
│   │   │   └── admin/         # Admin-specific HTTP functions
│   │   ├── auth/              # Client-side auth utilities, sign-out
│   │   ├── pos/               # POS product grouping, FEFO logic
│   │   ├── saas/              # Subscription types and feature key constants
│   │   ├── query/             # TanStack Query client config, cache invalidation helpers
│   │   ├── routes/            # Typed route path constants
│   │   └── utils.ts           # Shared utilities (cn, formatters…)
│   │
│   └── middleware.ts          # Edge middleware — maintenance mode, auth redirects, rate limiting
```

---

## API routing

All `/api/*` requests go through `lib/http/migrated-api-prefixes.ts` → `resolveApiUrl()`:

- Routes in `MIGRATED_API_PREFIXES` → proxied to `NEXT_PUBLIC_API_URL` (NestJS backend, port 4000)
- All other `/api/*` routes → handled by Next.js route handlers in `src/app/api/`

The 8 routes that remain in Next.js are auth/session handlers that must write HttpOnly cookies directly:

| Route | Reason in Next.js |
|---|---|
| `POST /api/auth/signout` | Clears HttpOnly cookie |
| `GET /api/auth/refresh` | Refreshes session JWT cookie |
| `GET /api/auth/confirm-email` | Email verification redirect |
| `POST /api/auth/complete-2fa` | Writes session cookie after 2FA |
| `GET /api/auth/verify-email-change` | Email change confirmation |
| `GET /api/auth/google` | Initiates Google OAuth flow |
| `GET /api/auth/google/callback` | Receives OAuth code, writes cookie |
| `GET /api/auth/bootstrap` | Reads session for SSR hydration |

---

## Data fetching patterns

All server data is fetched through **TanStack Query** hooks — no raw `fetch` in components:

- Each domain has a hook file in `src/hooks/`
- HTTP functions in `src/lib/http/` are pure async functions (no React)
- Mutations use `useMutation` with `onSuccess` cache updates via `setQueryData` or `invalidateQueries`
- `staleTime` is set per domain (5 min for lists, longer for static config, shorter for real-time data)

---

## Authentication flow

1. User signs in → Next.js `POST /api/auth/signin` route writes `pryrox_session` HttpOnly cookie
2. All subsequent requests include the cookie automatically
3. Next.js middleware (`src/middleware.ts`) verifies the cookie on every request
4. NestJS backend `SessionGuard` also verifies the same cookie on every API request
5. Both use the same `AUTH_SECRET` to verify the JWT signature

---

## Deployment notes

- Set `NODE_ENV=production`
- Set `NEXT_PUBLIC_API_URL` to your production backend URL
- Set `NEXT_PUBLIC_APP_URL` to your production frontend URL
- `AUTH_SECRET` must match the backend exactly
- Run `npm run build` then `npm run start`
- Redis is needed if rate limiting middleware is active
- The BullMQ worker (`npm run worker`) is a separate process — run it alongside the Next.js server

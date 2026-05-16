# Affordly AI

An AI-powered financial decision simulator where users enter their income, expenses, savings, debts, and a future decision (e.g. "Can I afford a £12,000 car?") to get an affordability score, 12-month cashflow projection, and AI-generated insight.

## Run & Operate

- `pnpm --filter @workspace/affordly run dev` — run the frontend (Vite, assigned port)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000 / assigned port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Recharts, Wouter (routing), React Hook Form
- API: Express 5, contract-first OpenAPI spec with Orval codegen
- DB: PostgreSQL + Drizzle ORM (`lib/db/src/schema/simulations.ts`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/simulations.ts` — DB schema for simulations table
- `artifacts/api-server/src/lib/simulation.ts` — Simulation engine + AI insight generator
- `artifacts/api-server/src/routes/simulations.ts` — CRUD routes
- `artifacts/api-server/src/routes/dashboard.ts` — Dashboard summary + recent endpoints
- `artifacts/affordly/src/pages/` — All frontend pages (home, dashboard, simulate, simulation-results, pricing)
- `artifacts/affordly/src/components/layout.tsx` — App shell with nav/footer

## Architecture decisions

- All simulation math runs server-side in `simulation.ts` — clients never compute scores directly
- `generateAIInsight()` is a placeholder function with comments showing where to connect OpenAI API
- Stripe pricing page uses disabled buttons as a placeholder — no real checkout
- `projectedSavings12m` stored as JSONB array in Postgres (12 monthly balance points)
- Numeric DB fields use `numeric` precision type and are cast to/from `number` in route handlers

## Product

- **Landing page** — marketing page with CTA, features, and financial disclaimer
- **Dashboard** — summary stats, recent simulations list, risk breakdown chart
- **New Simulation** — form with income, 5 expense categories, savings, debt, and decision cost
- **Results page** — affordability score meter, risk badge, 12-month savings chart (Recharts), AI insight, recommendations
- **Pricing page** — Free/Pro/Business tiers with Stripe placeholder

## User preferences

- Currency: £ GBP throughout the UI
- Disclaimer on landing page and results page: "This tool provides educational simulations only and is not financial advice."
- No emojis in the UI

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Always run `pnpm --filter @workspace/db run push` after changing schema files
- Numeric fields from Drizzle come back as strings — always wrap in `Number()` in route handlers
- OpenAI integration: replace `generateAIInsight()` in `simulation.ts` — the function has a `TODO` comment showing the pattern

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

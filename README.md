# Affordly AI

**AI-powered financial decision simulator** — enter your income, expenses, savings, and a decision cost to get an affordability score, 12-month cashflow projection, and personalised recommendations.

> This tool provides educational simulations only and is not financial advice.

---

## Live Demo

Run it locally in under 2 minutes — see [Getting Started](#getting-started).

---

## Screenshots

| Landing Page | Dashboard | Simulation Results |
|---|---|---|
| Dark navy hero with gradient headline | Live stats, score rings, risk breakdown | Score meter, 12-month chart, AI insight |

---

## Features

- **Affordability Score (0–100)** — weighted across 5 financial factors
- **Risk Classification** — Safe / Moderate / Risky / Dangerous
- **12-Month Savings Projection** — post-purchase trajectory chart (Recharts)
- **AI Insight** — contextual narrative analysis of the decision
- **Personalised Recommendations** — up to 5 actionable, data-driven suggestions
- **Dashboard** — summary stats, recent simulations, savings trend sparkline, risk breakdown
- **Pricing Page** — Free / Pro / Business tiers (Stripe placeholder)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui, Recharts, Wouter |
| API | Express 5, contract-first OpenAPI spec, Orval codegen |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4, drizzle-zod |
| Language | TypeScript 5.9, Node.js 24 |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
affordly/
├── artifacts/
│   ├── affordly/          # React + Vite frontend (preview path: /)
│   │   └── src/
│   │       ├── pages/     # home, dashboard, simulate, simulation-results, pricing
│   │       └── components/
│   └── api-server/        # Express 5 API server (preview path: /api)
│       └── src/
│           ├── lib/
│           │   ├── simulationEngine.ts   # Pure simulation logic (5 functions)
│           │   └── simulation.ts         # Orchestration + AI insight
│           └── routes/
│               ├── simulations.ts        # CRUD endpoints
│               └── dashboard.ts          # Summary + recent endpoints
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml   # OpenAPI spec (source of truth)
│   ├── api-client-react/  # Generated React Query hooks (do not edit)
│   ├── api-zod/           # Generated Zod schemas (do not edit)
│   └── db/
│       └── src/schema/
│           └── simulations.ts   # Drizzle schema
└── scripts/               # Utility scripts
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database

### 1. Clone and install

```bash
git clone https://github.com/your-username/affordly-ai.git
cd affordly-ai
pnpm install
```

### 2. Set environment variables

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/affordly

# Optional (for session handling)
SESSION_SECRET=your-secret-here
```

### 3. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 4. Run the development servers

In two separate terminals:

```bash
# Terminal 1 — API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (port 5173)
pnpm --filter @workspace/affordly run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Simulation Engine

All financial maths live in [`artifacts/api-server/src/lib/simulationEngine.ts`](artifacts/api-server/src/lib/simulationEngine.ts). The engine is purely functional — no side effects, no database calls.

### Functions

| Function | Description |
|---|---|
| `calculateMonthlyCashflow(input)` | Net cashflow, savings rate, months-until-empty |
| `calculateAffordabilityScore(params)` | 0–100 score across 5 weighted factors |
| `classifyRiskLevel(score)` | Maps score → Safe / Moderate / Risky / Dangerous |
| `projectSavingsOver12Months(params)` | Post-purchase 12-month balance array |
| `generateRecommendations(params)` | Up to 5 actionable, data-driven suggestions |

### Scoring weights

| Factor | Weight |
|---|---|
| Savings coverage of decision cost | 35 pts |
| Net cashflow as share of income | 30 pts |
| Debt-to-annual-income ratio | 20 pts |
| Monthly savings rate | 10 pts |
| Post-purchase emergency fund adequacy | 5 pts |

---

## API Reference

Base URL: `/api`

| Method | Path | Description |
|---|---|---|
| `POST` | `/simulations` | Create and score a new simulation |
| `GET` | `/simulations` | List all simulations |
| `GET` | `/simulations/:id` | Get simulation by ID |
| `DELETE` | `/simulations/:id` | Delete a simulation |
| `GET` | `/dashboard/summary` | Aggregated stats |
| `GET` | `/dashboard/recent` | 5 most recent simulations |
| `GET` | `/healthz` | Health check |

Full spec: [`lib/api-spec/openapi.yaml`](lib/api-spec/openapi.yaml)

### Example request

```bash
curl -X POST http://localhost:8080/api/simulations \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioName": "Buy a used car",
    "monthlyIncome": 3500,
    "monthlyRent": 900,
    "monthlyFood": 300,
    "monthlyTransport": 100,
    "monthlySubscriptions": 50,
    "monthlyOther": 200,
    "savingsBalance": 8000,
    "debtBalance": 2000,
    "decisionCost": 5000,
    "monthlyExtraCost": 150
  }'
```

### Example response (key fields)

```json
{
  "affordabilityScore": 71,
  "riskLevel": "Moderate",
  "monthlyCashflow": 1950,
  "savingsAfterDecision": 3000,
  "recommendations": [
    "Maintain an emergency fund of at least £4,650 (3 months of expenses)..."
  ],
  "projectedSavings12m": [4950, 6900, 8850, ...]
}
```

---

## Codegen

After changing `openapi.yaml`, regenerate the TypeScript client and Zod schemas:

```bash
pnpm --filter @workspace/api-spec run codegen
```

After changing the Drizzle schema, push to the database:

```bash
pnpm --filter @workspace/db run push
```

---

## Connecting OpenAI

The `generateAIInsight()` function in `simulation.ts` is a placeholder. To connect a real model:

1. Add your `OPENAI_API_KEY` environment variable
2. Open `artifacts/api-server/src/lib/simulation.ts`
3. Find the `TODO` comment and replace the placeholder with an API call:

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: buildPrompt(input, engine) }],
});
const aiInsight = response.choices[0].message.content ?? "";
```

---

## Scripts

```bash
pnpm run typecheck        # Full TypeScript check across all packages
pnpm run build            # Typecheck + build all packages
```

---

## Disclaimer

This tool is for educational and demonstrational purposes only. It does not constitute financial advice. Always consult a qualified financial adviser before making significant financial decisions.

---

## License

MIT

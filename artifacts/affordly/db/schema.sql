CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name TEXT NOT NULL,
  income NUMERIC NOT NULL DEFAULT 0,
  expenses NUMERIC NOT NULL DEFAULT 0,
  savings NUMERIC NOT NULL DEFAULT 0,
  debt NUMERIC NOT NULL DEFAULT 0,
  decision_cost NUMERIC NOT NULL DEFAULT 0,
  monthly_extra_cost NUMERIC NOT NULL DEFAULT 0,
  affordability_score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'Unknown',
  ai_insight TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

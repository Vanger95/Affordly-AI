export interface ApiSimulationRow {
  id: number | string;
  scenario_name: string;
  monthly_income: string | number;
  monthly_rent: string | number;
  monthly_food: string | number;
  monthly_transport: string | number;
  monthly_subscriptions: string | number;
  monthly_other: string | number;
  savings_balance: string | number;
  debt_balance: string | number;
  decision_cost: string | number;
  monthly_extra_cost: string | number | null;
  total_monthly_expenses: string | number;
  monthly_cashflow: string | number;
  savings_rate: string | number;
  months_savings_last: string | number | null;
  affordability_score: string | number;
  risk_level: string;
  ai_insight: string | null;
  projected_savings_12m: number[] | string | null;
  savings_after_decision: string | number;
  recommendations: string[] | string | null;
  created_at: string;
}

export interface MappedSimulation {
  id: string;
  scenarioName: string;
  monthlyIncome: number;
  monthlyRent: number;
  monthlyFood: number;
  monthlyTransport: number;
  monthlySubscriptions: number;
  monthlyOther: number;
  savingsBalance: number;
  debtBalance: number;
  decisionCost: number;
  monthlyExtraCost: number | null;
  totalMonthlyExpenses: number;
  monthlyCashflow: number;
  savingsRate: number;
  monthsSavingsLast: number | null;
  affordabilityScore: number;
  riskLevel: string;
  aiInsight: string;
  projectedSavings12m: number[];
  savingsAfterDecision: number;
  recommendations: string[];
  createdAt: string;
}

function parseJsonArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return []; }
  }
  return [];
}

export function mapApiSimulation(s: ApiSimulationRow): MappedSimulation {
  return {
    id: String(s.id),
    scenarioName: s.scenario_name,
    monthlyIncome: Number(s.monthly_income),
    monthlyRent: Number(s.monthly_rent),
    monthlyFood: Number(s.monthly_food),
    monthlyTransport: Number(s.monthly_transport),
    monthlySubscriptions: Number(s.monthly_subscriptions),
    monthlyOther: Number(s.monthly_other),
    savingsBalance: Number(s.savings_balance),
    debtBalance: Number(s.debt_balance),
    decisionCost: Number(s.decision_cost),
    monthlyExtraCost:
      s.monthly_extra_cost !== null && s.monthly_extra_cost !== undefined
        ? Number(s.monthly_extra_cost)
        : null,
    totalMonthlyExpenses: Number(s.total_monthly_expenses),
    monthlyCashflow: Number(s.monthly_cashflow),
    savingsRate: Number(s.savings_rate),
    monthsSavingsLast:
      s.months_savings_last !== null && s.months_savings_last !== undefined
        ? Number(s.months_savings_last)
        : null,
    affordabilityScore: Number(s.affordability_score),
    riskLevel: s.risk_level,
    aiInsight: s.ai_insight ?? "",
    projectedSavings12m: parseJsonArray(s.projected_savings_12m) as number[],
    savingsAfterDecision: Number(s.savings_after_decision),
    recommendations: parseJsonArray(s.recommendations) as string[],
    createdAt: s.created_at,
  };
}

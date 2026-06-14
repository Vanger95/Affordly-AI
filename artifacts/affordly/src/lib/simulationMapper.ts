export interface ApiSimulationRow {
  id: string;
  scenario_name: string;
  income: string | number;
  expenses: string | number;
  savings: string | number;
  debt: string | number;
  decision_cost: string | number;
  monthly_extra_cost: string | number | null;
  affordability_score: string | number;
  risk_level: string;
  ai_insight: string | null;
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
  affordabilityScore: number;
  riskLevel: string;
  aiInsight: string;
  createdAt: string;
  monthlyCashflow: number;
  savingsRate: number;
  totalMonthlyExpenses: number;
  monthsSavingsLast: number | null;
  projectedSavings12m: number[];
  savingsAfterDecision: number;
  recommendations: string[];
}

export function mapApiSimulation(s: ApiSimulationRow): MappedSimulation {
  const income = Number(s.income);
  const expenses = Number(s.expenses);
  const savings = Number(s.savings);
  const debt = Number(s.debt);
  const decisionCost = Number(s.decision_cost);
  const monthlyExtraCost =
    s.monthly_extra_cost !== null && s.monthly_extra_cost !== undefined
      ? Number(s.monthly_extra_cost)
      : null;
  const affordabilityScore = Number(s.affordability_score);

  const monthlyCashflow = income - expenses - (monthlyExtraCost ?? 0);
  const savingsRate = income > 0 ? Math.max(0, Math.min(1, monthlyCashflow / income)) : 0;
  const savingsAfterDecision = Math.max(0, savings - decisionCost);
  const monthsSavingsLast =
    monthlyCashflow < 0 && savings > 0 ? savings / Math.abs(monthlyCashflow) : null;

  const projectedSavings12m = Array.from(
    { length: 12 },
    (_, i) => savingsAfterDecision + monthlyCashflow * (i + 1),
  );

  return {
    id: s.id,
    scenarioName: s.scenario_name,
    monthlyIncome: income,
    monthlyRent: 0,
    monthlyFood: 0,
    monthlyTransport: 0,
    monthlySubscriptions: 0,
    monthlyOther: expenses,
    savingsBalance: savings,
    debtBalance: debt,
    decisionCost,
    monthlyExtraCost,
    affordabilityScore,
    riskLevel: s.risk_level,
    aiInsight: s.ai_insight ?? "",
    createdAt: s.created_at,
    monthlyCashflow,
    savingsRate,
    totalMonthlyExpenses: expenses,
    monthsSavingsLast,
    projectedSavings12m,
    savingsAfterDecision,
    recommendations: [],
  };
}

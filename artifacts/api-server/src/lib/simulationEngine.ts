/**
 * simulationEngine.ts
 *
 * Pure, stateless financial simulation engine.
 * All functions are deterministic — no DB or HTTP dependencies.
 *
 * Scoring weights:
 *   35 pts  — savings coverage of decision cost
 *   30 pts  — ongoing cashflow health
 *   20 pts  — debt-to-annual-income ratio
 *   10 pts  — savings rate
 *    5 pts  — post-purchase emergency fund adequacy
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SimulationInput {
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
  monthlyExtraCost?: number | null;
}

export interface CashflowResult {
  totalExpenses: number;
  monthlyCashflow: number;
  savingsRate: number;
  monthsSavingsLast: number | null;
}

export interface ScoreParams {
  monthlyCashflow: number;
  monthlyIncome: number;
  totalExpenses: number;
  savingsBalance: number;
  decisionCost: number;
  debtBalance: number;
  savingsRate: number;
}

export interface ProjectionParams {
  savingsBalance: number;
  decisionCost: number;
  monthlyCashflow: number;
}

export interface RecommendationParams {
  input: SimulationInput;
  totalExpenses: number;
  monthlyCashflow: number;
  savingsAfterDecision: number;
  affordabilityScore: number;
  riskLevel: RiskLevel;
  savingsRate: number;
  monthsSavingsLast: number | null;
}

export type RiskLevel = "Safe" | "Moderate" | "Risky" | "Dangerous";

export interface EngineResult {
  totalExpenses: number;
  monthlyCashflow: number;
  savingsAfterDecision: number;
  savingsProjection: number[];
  affordabilityScore: number;
  riskLevel: RiskLevel;
  recommendations: string[];
  savingsRate: number;
  monthsSavingsLast: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// calculateMonthlyCashflow
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes total monthly expenses, net cashflow, savings rate, and — when
 * cashflow is negative — how many months the current savings balance will last.
 */
export function calculateMonthlyCashflow(input: SimulationInput): CashflowResult {
  const extraCost = input.monthlyExtraCost ?? 0;

  const totalExpenses =
    input.monthlyRent +
    input.monthlyFood +
    input.monthlyTransport +
    input.monthlySubscriptions +
    input.monthlyOther +
    extraCost;

  const monthlyCashflow = input.monthlyIncome - totalExpenses;
  const savingsRate = input.monthlyIncome > 0 ? monthlyCashflow / input.monthlyIncome : 0;

  let monthsSavingsLast: number | null = null;
  if (monthlyCashflow < 0 && input.savingsBalance > 0) {
    monthsSavingsLast =
      Math.round((input.savingsBalance / Math.abs(monthlyCashflow)) * 10) / 10;
  }

  return { totalExpenses, monthlyCashflow, savingsRate, monthsSavingsLast };
}

// ─────────────────────────────────────────────────────────────────────────────
// calculateAffordabilityScore
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a 0–100 affordability score based on five weighted factors:
 *
 *  Factor 1 (35 pts): Savings-to-decision-cost coverage ratio
 *  Factor 2 (30 pts): Net cashflow as a share of income
 *  Factor 3 (20 pts): Debt-to-annual-income ratio
 *  Factor 4 (10 pts): Monthly savings rate
 *  Factor 5 ( 5 pts): Post-purchase emergency fund adequacy (3 months' expenses)
 */
export function calculateAffordabilityScore(params: ScoreParams): number {
  const {
    monthlyCashflow,
    monthlyIncome,
    totalExpenses,
    savingsBalance,
    decisionCost,
    debtBalance,
    savingsRate,
  } = params;

  let score = 0;

  // Factor 1 — savings coverage (35 pts)
  const coverage = decisionCost > 0 ? savingsBalance / decisionCost : savingsBalance > 0 ? Infinity : 1;
  if (coverage >= 3)       score += 35;
  else if (coverage >= 2)  score += 30;
  else if (coverage >= 1)  score += 22;
  else if (coverage >= 0.5) score += 12;
  // else 0

  // Factor 2 — cashflow health (30 pts)
  const cashflowRatio = monthlyIncome > 0 ? monthlyCashflow / monthlyIncome : 0;
  if (cashflowRatio >= 0.35)      score += 30;
  else if (cashflowRatio >= 0.20) score += 23;
  else if (cashflowRatio >= 0.10) score += 15;
  else if (cashflowRatio >= 0)    score += 7;
  else if (monthlyCashflow >= -100) score += 3;
  // else 0

  // Factor 3 — debt-to-annual-income (20 pts)
  const annualIncome = monthlyIncome * 12;
  const dti = annualIncome > 0 ? debtBalance / annualIncome : debtBalance > 0 ? 10 : 0;
  if (dti <= 0.05)       score += 20;
  else if (dti <= 0.20)  score += 15;
  else if (dti <= 0.40)  score += 8;
  else if (dti <= 0.60)  score += 3;
  // else 0

  // Factor 4 — savings rate (10 pts)
  if (savingsRate >= 0.25)      score += 10;
  else if (savingsRate >= 0.15) score += 7;
  else if (savingsRate >= 0.05) score += 4;
  else if (savingsRate >= 0)    score += 1;
  // else 0

  // Factor 5 — emergency fund after purchase (5 pts)
  const emergencyTarget = totalExpenses * 3;
  const balanceAfter = savingsBalance - decisionCost;
  if (balanceAfter >= emergencyTarget)           score += 5;
  else if (balanceAfter >= emergencyTarget * 0.5) score += 2;
  // else 0

  return Math.min(100, Math.max(0, Math.round(score)));
}

// ─────────────────────────────────────────────────────────────────────────────
// classifyRiskLevel
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps an affordability score to a human-readable risk label.
 *
 *  ≥ 75  → Safe
 *  ≥ 50  → Moderate
 *  ≥ 25  → Risky
 *  < 25  → Dangerous
 */
export function classifyRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "Safe";
  if (score >= 50) return "Moderate";
  if (score >= 25) return "Risky";
  return "Dangerous";
}

// ─────────────────────────────────────────────────────────────────────────────
// projectSavingsOver12Months
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns an array of 12 monthly savings balances.
 *
 * The decision cost is deducted from the starting balance before month 1 so
 * that the chart reflects the real post-purchase trajectory, not an inflated
 * pre-purchase baseline.
 */
export function projectSavingsOver12Months(params: ProjectionParams): number[] {
  const { savingsBalance, decisionCost, monthlyCashflow } = params;
  const projection: number[] = [];
  let balance = savingsBalance - decisionCost;

  for (let month = 1; month <= 12; month++) {
    balance += monthlyCashflow;
    projection.push(Math.round(balance * 100) / 100);
  }

  return projection;
}

// ─────────────────────────────────────────────────────────────────────────────
// generateRecommendations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Produces up to 5 actionable, context-specific recommendations based on the
 * simulation inputs and computed results. Each recommendation is a single
 * sentence and references real numbers from the user's profile.
 */
export function generateRecommendations(params: RecommendationParams): string[] {
  const {
    input,
    totalExpenses,
    monthlyCashflow,
    savingsAfterDecision,
    affordabilityScore,
    savingsRate,
    monthsSavingsLast,
  } = params;

  const fmt = (n: number) =>
    `£${Math.abs(n).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;

  const recs: string[] = [];

  // 1. Emergency fund
  const emergencyTarget = totalExpenses * 3;
  if (savingsAfterDecision < emergencyTarget) {
    const shortfall = emergencyTarget - Math.max(0, savingsAfterDecision);
    recs.push(
      `Maintain an emergency fund of at least ${fmt(emergencyTarget)} (3 months of expenses); ` +
      `after this purchase you would have ${fmt(Math.max(0, savingsAfterDecision))}, ` +
      `so build up the remaining ${fmt(shortfall)} before committing.`
    );
  }

  // 2. Negative cashflow
  if (monthlyCashflow < 0) {
    const longevity =
      monthsSavingsLast !== null
        ? ` and your savings would cover roughly ${Math.round(monthsSavingsLast)} months at this rate`
        : "";
    recs.push(
      `Your monthly expenses exceed income by ${fmt(Math.abs(monthlyCashflow))}${longevity} — ` +
      `prioritise cutting discretionary costs or increasing income before committing to this purchase.`
    );
  }

  // 3. Low savings rate
  if (savingsRate < 0.1 && monthlyCashflow >= 0) {
    const target = input.monthlyIncome * 0.15;
    recs.push(
      `Your current savings rate is ${Math.round(savingsRate * 100)}%; ` +
      `aim for at least 15% (${fmt(target)}/month) to build a resilient long-term buffer.`
    );
  }

  // 4. High debt load
  const dti = input.monthlyIncome > 0
    ? input.debtBalance / (input.monthlyIncome * 12)
    : 0;
  if (dti > 0.4) {
    recs.push(
      `Your debt-to-annual-income ratio is ${Math.round(dti * 100)}%, above the recommended 40% ceiling — ` +
      `consider paying down ${fmt(input.debtBalance)} in existing debt before adding this commitment.`
    );
  }

  // 5. Savings shortfall for upfront cost
  if (input.savingsBalance < input.decisionCost) {
    const gap = input.decisionCost - input.savingsBalance;
    const months =
      monthlyCashflow > 0 ? Math.ceil(gap / monthlyCashflow) : null;
    recs.push(
      months !== null
        ? `Savings of ${fmt(input.savingsBalance)} fall ${fmt(gap)} short of the decision cost — ` +
          `at your current cashflow you could bridge this gap in approximately ${months} month${months === 1 ? "" : "s"}.`
        : `Savings of ${fmt(input.savingsBalance)} fall short of the ${fmt(input.decisionCost)} decision cost — ` +
          `delay until you have saved at least the full amount.`
    );
  }

  // 6. Healthy position note (only when no other recommendations fired)
  if (affordabilityScore >= 75 && recs.length === 0) {
    recs.push(
      `Your financial position is well-suited for this decision — ` +
      `just ensure you retain at least ${fmt(emergencyTarget)} in savings after the purchase to maintain your safety net.`
    );
  }

  // 7. Recurring cost impact
  if (input.monthlyExtraCost && input.monthlyExtraCost > 0) {
    recs.push(
      `The ongoing ${fmt(input.monthlyExtraCost)}/month cost amounts to ${fmt(input.monthlyExtraCost * 12)} per year — ` +
      `treat it as a fixed line in your budget from day one.`
    );
  }

  return recs.slice(0, 5);
}

// ─────────────────────────────────────────────────────────────────────────────
// runEngine  (main orchestrator)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Orchestrates all engine functions and returns a fully computed EngineResult.
 * This is the single entry point used by the API route handler.
 */
export function runEngine(input: SimulationInput): EngineResult {
  const { totalExpenses, monthlyCashflow, savingsRate, monthsSavingsLast } =
    calculateMonthlyCashflow(input);

  const affordabilityScore = calculateAffordabilityScore({
    monthlyCashflow,
    monthlyIncome: input.monthlyIncome,
    totalExpenses,
    savingsBalance: input.savingsBalance,
    decisionCost: input.decisionCost,
    debtBalance: input.debtBalance,
    savingsRate,
  });

  const riskLevel = classifyRiskLevel(affordabilityScore);

  const savingsAfterDecision =
    Math.round((input.savingsBalance - input.decisionCost) * 100) / 100;

  const savingsProjection = projectSavingsOver12Months({
    savingsBalance: input.savingsBalance,
    decisionCost: input.decisionCost,
    monthlyCashflow,
  });

  const recommendations = generateRecommendations({
    input,
    totalExpenses,
    monthlyCashflow,
    savingsAfterDecision,
    affordabilityScore,
    riskLevel,
    savingsRate,
    monthsSavingsLast,
  });

  return {
    totalExpenses,
    monthlyCashflow,
    savingsAfterDecision,
    savingsProjection,
    affordabilityScore,
    riskLevel,
    recommendations,
    savingsRate,
    monthsSavingsLast,
  };
}

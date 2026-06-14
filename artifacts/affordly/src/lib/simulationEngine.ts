/**
 * simulationEngine.ts — frontend copy (no backend dependencies)
 *
 * Scoring weights:
 *   35 pts  — savings coverage of decision cost
 *   30 pts  — ongoing cashflow health
 *   20 pts  — debt-to-annual-income ratio
 *   10 pts  — savings rate
 *    5 pts  — post-purchase emergency fund adequacy
 */

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
  aiInsight: string;
}

function calculateMonthlyCashflow(input: SimulationInput) {
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

function calculateAffordabilityScore(params: {
  monthlyCashflow: number;
  monthlyIncome: number;
  totalExpenses: number;
  savingsBalance: number;
  decisionCost: number;
  debtBalance: number;
  savingsRate: number;
}): number {
  const { monthlyCashflow, monthlyIncome, totalExpenses, savingsBalance, decisionCost, debtBalance, savingsRate } = params;
  let score = 0;

  const coverage = decisionCost > 0 ? savingsBalance / decisionCost : savingsBalance > 0 ? Infinity : 1;
  if (coverage >= 3)        score += 35;
  else if (coverage >= 2)   score += 30;
  else if (coverage >= 1)   score += 22;
  else if (coverage >= 0.5) score += 12;

  const cashflowRatio = monthlyIncome > 0 ? monthlyCashflow / monthlyIncome : 0;
  if (cashflowRatio >= 0.35)       score += 30;
  else if (cashflowRatio >= 0.20)  score += 23;
  else if (cashflowRatio >= 0.10)  score += 15;
  else if (cashflowRatio >= 0)     score += 7;
  else if (monthlyCashflow >= -100) score += 3;

  const annualIncome = monthlyIncome * 12;
  const dti = annualIncome > 0 ? debtBalance / annualIncome : debtBalance > 0 ? 10 : 0;
  if (dti <= 0.05)      score += 20;
  else if (dti <= 0.20) score += 15;
  else if (dti <= 0.40) score += 8;
  else if (dti <= 0.60) score += 3;

  if (savingsRate >= 0.25)      score += 10;
  else if (savingsRate >= 0.15) score += 7;
  else if (savingsRate >= 0.05) score += 4;
  else if (savingsRate >= 0)    score += 1;

  const emergencyTarget = totalExpenses * 3;
  const balanceAfter = savingsBalance - decisionCost;
  if (balanceAfter >= emergencyTarget)            score += 5;
  else if (balanceAfter >= emergencyTarget * 0.5) score += 2;

  return Math.min(100, Math.max(0, Math.round(score)));
}

function classifyRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "Safe";
  if (score >= 50) return "Moderate";
  if (score >= 25) return "Risky";
  return "Dangerous";
}

function projectSavingsOver12Months(savingsBalance: number, decisionCost: number, monthlyCashflow: number): number[] {
  const projection: number[] = [];
  let balance = savingsBalance - decisionCost;
  for (let month = 1; month <= 12; month++) {
    balance += monthlyCashflow;
    projection.push(Math.round(balance * 100) / 100);
  }
  return projection;
}

function generateRecommendations(
  input: SimulationInput,
  totalExpenses: number,
  monthlyCashflow: number,
  savingsAfterDecision: number,
  affordabilityScore: number,
  savingsRate: number,
  monthsSavingsLast: number | null,
): string[] {
  const fmt = (n: number) =>
    `£${Math.abs(n).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
  const recs: string[] = [];

  const emergencyTarget = totalExpenses * 3;
  if (savingsAfterDecision < emergencyTarget) {
    const shortfall = emergencyTarget - Math.max(0, savingsAfterDecision);
    recs.push(
      `Maintain an emergency fund of at least ${fmt(emergencyTarget)} (3 months of expenses); ` +
      `after this purchase you would have ${fmt(Math.max(0, savingsAfterDecision))}, ` +
      `so build up the remaining ${fmt(shortfall)} before committing.`
    );
  }

  if (monthlyCashflow < 0) {
    const longevity = monthsSavingsLast !== null
      ? ` and your savings would cover roughly ${Math.round(monthsSavingsLast)} months at this rate`
      : "";
    recs.push(
      `Your monthly expenses exceed income by ${fmt(Math.abs(monthlyCashflow))}${longevity} — ` +
      `prioritise cutting discretionary costs or increasing income before committing to this purchase.`
    );
  }

  if (savingsRate < 0.1 && monthlyCashflow >= 0) {
    const target = input.monthlyIncome * 0.15;
    recs.push(
      `Your current savings rate is ${Math.round(savingsRate * 100)}%; ` +
      `aim for at least 15% (${fmt(target)}/month) to build a resilient long-term buffer.`
    );
  }

  const dti = input.monthlyIncome > 0 ? input.debtBalance / (input.monthlyIncome * 12) : 0;
  if (dti > 0.4) {
    recs.push(
      `Your debt-to-annual-income ratio is ${Math.round(dti * 100)}%, above the recommended 40% ceiling — ` +
      `consider paying down ${fmt(input.debtBalance)} in existing debt before adding this commitment.`
    );
  }

  if (input.savingsBalance < input.decisionCost) {
    const gap = input.decisionCost - input.savingsBalance;
    const months = monthlyCashflow > 0 ? Math.ceil(gap / monthlyCashflow) : null;
    recs.push(
      months !== null
        ? `Savings of ${fmt(input.savingsBalance)} fall ${fmt(gap)} short of the decision cost — ` +
          `at your current cashflow you could bridge this gap in approximately ${months} month${months === 1 ? "" : "s"}.`
        : `Savings of ${fmt(input.savingsBalance)} fall short of the ${fmt(input.decisionCost)} decision cost — ` +
          `delay until you have saved at least the full amount.`
    );
  }

  if (affordabilityScore >= 75 && recs.length === 0) {
    recs.push(
      `Your financial position is well-suited for this decision — ` +
      `just ensure you retain at least ${fmt(emergencyTarget)} in savings after the purchase to maintain your safety net.`
    );
  }

  if (input.monthlyExtraCost && input.monthlyExtraCost > 0) {
    recs.push(
      `The ongoing ${fmt(input.monthlyExtraCost)}/month cost amounts to ${fmt(input.monthlyExtraCost * 12)} per year — ` +
      `treat it as a fixed line in your budget from day one.`
    );
  }

  return recs.slice(0, 5);
}

function generateAiInsight(input: SimulationInput, score: number, risk: RiskLevel, cashflow: number): string {
  const cf = cashflow >= 0
    ? `a monthly surplus of £${cashflow.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`
    : `a monthly shortfall of £${Math.abs(cashflow).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;

  if (risk === "Safe") {
    return `Based on your financial profile, "${input.scenarioName}" appears well within your means. With an affordability score of ${score}/100 and ${cf}, this decision is financially sound given your current position. Ensure you maintain an adequate emergency fund after the purchase.`;
  }
  if (risk === "Moderate") {
    return `Your financial profile shows moderate capacity for "${input.scenarioName}" (score: ${score}/100). With ${cf} per month, this is feasible but requires careful budgeting. Monitor your cashflow closely after committing and keep a robust emergency fund in place.`;
  }
  if (risk === "Risky") {
    return `"${input.scenarioName}" carries notable risk given your current finances (score: ${score}/100). You have ${cf} per month, which leaves limited room for unexpected costs. Consider strengthening your savings position before proceeding.`;
  }
  return `This simulation highlights significant financial strain from "${input.scenarioName}" (score: ${score}/100). With ${cf} per month, this decision could jeopardise your financial stability. It is strongly recommended to delay until your financial position improves substantially.`;
}

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
  const savingsAfterDecision = Math.round((input.savingsBalance - input.decisionCost) * 100) / 100;
  const savingsProjection = projectSavingsOver12Months(input.savingsBalance, input.decisionCost, monthlyCashflow);

  const recommendations = generateRecommendations(
    input, totalExpenses, monthlyCashflow, savingsAfterDecision,
    affordabilityScore, savingsRate, monthsSavingsLast,
  );

  const aiInsight = generateAiInsight(input, affordabilityScore, riskLevel, monthlyCashflow);

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
    aiInsight,
  };
}

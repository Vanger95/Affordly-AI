/**
 * simulation.ts
 *
 * Thin orchestration layer that wires the simulation engine to the AI insight
 * generator and returns the full SimulationResult consumed by route handlers.
 *
 * All maths live in simulationEngine.ts.
 * Replace generateAIInsight() with an OpenAI call when ready (see TODO below).
 */

import { runEngine, type SimulationInput } from "./simulationEngine";

export type { SimulationInput } from "./simulationEngine";

export interface SimulationResult {
  totalMonthlyExpenses: number;
  monthlyCashflow: number;
  savingsRate: number;
  monthsSavingsLast: number | null;
  savingsAfterDecision: number;
  affordabilityScore: number;
  riskLevel: "Safe" | "Moderate" | "Risky" | "Dangerous";
  aiInsight: string;
  projectedSavings12m: number[];
  recommendations: string[];
}

export function runSimulation(input: SimulationInput): SimulationResult {
  const engine = runEngine(input);

  // TODO: Replace generateAIInsight() with an OpenAI API call:
  //   const response = await openai.chat.completions.create({
  //     model: "gpt-4o",
  //     messages: [{ role: "user", content: buildPrompt(input, engine) }],
  //   });
  //   const aiInsight = response.choices[0].message.content ?? "";
  const aiInsight = generateAIInsight(input, engine);

  return {
    totalMonthlyExpenses: engine.totalExpenses,
    monthlyCashflow: engine.monthlyCashflow,
    savingsRate: engine.savingsRate,
    monthsSavingsLast: engine.monthsSavingsLast,
    savingsAfterDecision: engine.savingsAfterDecision,
    affordabilityScore: engine.affordabilityScore,
    riskLevel: engine.riskLevel,
    aiInsight,
    projectedSavings12m: engine.savingsProjection,
    recommendations: engine.recommendations,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Insight generator (placeholder)
// ─────────────────────────────────────────────────────────────────────────────

interface InsightContext {
  affordabilityScore: number;
  riskLevel: string;
  monthlyCashflow: number;
  savingsRate: number;
  totalExpenses: number;
  monthsSavingsLast: number | null;
  savingsProjection: number[];
  savingsAfterDecision: number;
}

function generateAIInsight(input: SimulationInput, ctx: InsightContext): string {
  const fmt = (n: number) =>
    `£${Math.abs(n).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
  const cashflowStr =
    ctx.monthlyCashflow >= 0
      ? `a positive monthly cashflow of ${fmt(ctx.monthlyCashflow)}`
      : `a monthly shortfall of ${fmt(ctx.monthlyCashflow)}`;
  const savingsRatePct = Math.round(ctx.savingsRate * 100);
  const coverageX =
    input.decisionCost > 0
      ? Math.round((input.savingsBalance / input.decisionCost) * 10) / 10
      : null;

  const projEnd = ctx.savingsProjection[11] ?? ctx.savingsAfterDecision;
  const trend = projEnd > input.savingsBalance ? "growth" : "pressure";

  if (ctx.riskLevel === "Safe") {
    return (
      `Based on your financial profile, ${input.scenarioName} is well within your means. ` +
      `Your savings of ${fmt(input.savingsBalance)} cover the ${fmt(input.decisionCost)} cost` +
      (coverageX !== null && coverageX > 1 ? ` ${coverageX}× over` : " in full") +
      `, and you maintain ${cashflowStr} after all expenses. ` +
      `With a ${savingsRatePct}% savings rate, your 12-month trajectory shows continued ${trend}. ` +
      `Ensure you keep at least ${fmt(ctx.totalExpenses * 3)} as an emergency buffer after the purchase.`
    );
  }

  if (ctx.riskLevel === "Moderate") {
    return (
      `Your profile shows ${input.scenarioName} is achievable but warrants care. ` +
      `You have ${cashflowStr}, leaving a limited buffer for unexpected costs. ` +
      `Savings of ${fmt(input.savingsBalance)} ` +
      (input.savingsBalance >= input.decisionCost ? "cover the upfront cost" : "fall short of the full decision cost") +
      `, and your ${savingsRatePct}% savings rate is ${savingsRatePct >= 10 ? "reasonable" : "on the lower end"}. ` +
      `The 12-month projection shows gradual ${trend}. ` +
      `Consider whether you can trim discretionary spending before committing.`
    );
  }

  if (ctx.riskLevel === "Risky") {
    return (
      `The numbers raise concerns about ${input.scenarioName} right now. ` +
      `You have ${cashflowStr}` +
      (ctx.monthsSavingsLast !== null
        ? `, and savings could sustain you for roughly ${Math.round(ctx.monthsSavingsLast)} months`
        : "") +
      `. The ${fmt(input.decisionCost)} commitment would put noticeable strain on your position, ` +
      `and the 12-month projection shows ${trend}. ` +
      `Consider delaying until your cashflow improves by at least ${fmt(Math.abs(ctx.monthlyCashflow) + input.monthlyIncome * 0.1)}.`
    );
  }

  return (
    `The current picture shows significant strain that makes ${input.scenarioName} inadvisable now. ` +
    `With ${cashflowStr}` +
    (ctx.monthsSavingsLast !== null
      ? ` and savings that may last only ${Math.round(ctx.monthsSavingsLast)} months`
      : "") +
    `, adding a ${fmt(input.decisionCost)} commitment could create serious pressure. ` +
    `Focus on closing the cashflow gap first — even a ${fmt(input.monthlyIncome * 0.1)} monthly improvement ` +
    `would meaningfully change the picture within a few months.`
  );
}

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

export interface SimulationResult {
  totalMonthlyExpenses: number;
  monthlyCashflow: number;
  savingsRate: number;
  monthsSavingsLast: number | null;
  affordabilityScore: number;
  riskLevel: "Safe" | "Moderate" | "Risky" | "Dangerous";
  aiInsight: string;
  projectedSavings12m: number[];
}

export function runSimulation(input: SimulationInput): SimulationResult {
  const extraCost = input.monthlyExtraCost ?? 0;

  const totalMonthlyExpenses =
    input.monthlyRent +
    input.monthlyFood +
    input.monthlyTransport +
    input.monthlySubscriptions +
    input.monthlyOther +
    extraCost;

  const monthlyCashflow = input.monthlyIncome - totalMonthlyExpenses;
  const savingsRate = input.monthlyIncome > 0 ? monthlyCashflow / input.monthlyIncome : 0;

  // How many months savings will last if cashflow is negative
  let monthsSavingsLast: number | null = null;
  if (monthlyCashflow < 0 && input.savingsBalance > 0) {
    monthsSavingsLast = input.savingsBalance / Math.abs(monthlyCashflow);
  }

  // Affordability score 0-100
  // Factors:
  // 1. Can savings cover the decision cost? (40 pts)
  // 2. Cashflow health (30 pts)
  // 3. Debt-to-income ratio (20 pts)
  // 4. Savings rate health (10 pts)
  let score = 0;

  // Factor 1: savings coverage of decision cost
  if (input.savingsBalance >= input.decisionCost * 2) {
    score += 40;
  } else if (input.savingsBalance >= input.decisionCost) {
    score += 28;
  } else if (input.savingsBalance >= input.decisionCost * 0.5) {
    score += 15;
  } else {
    score += 0;
  }

  // Factor 2: cashflow health
  if (monthlyCashflow >= input.monthlyIncome * 0.3) {
    score += 30;
  } else if (monthlyCashflow >= input.monthlyIncome * 0.15) {
    score += 22;
  } else if (monthlyCashflow >= 0) {
    score += 12;
  } else if (monthlyCashflow >= -200) {
    score += 4;
  } else {
    score += 0;
  }

  // Factor 3: debt-to-income ratio
  const debtToIncome = input.monthlyIncome > 0 ? input.debtBalance / (input.monthlyIncome * 12) : 10;
  if (debtToIncome <= 0.1) {
    score += 20;
  } else if (debtToIncome <= 0.3) {
    score += 14;
  } else if (debtToIncome <= 0.5) {
    score += 7;
  } else {
    score += 0;
  }

  // Factor 4: savings rate
  if (savingsRate >= 0.2) {
    score += 10;
  } else if (savingsRate >= 0.1) {
    score += 7;
  } else if (savingsRate >= 0) {
    score += 3;
  } else {
    score += 0;
  }

  const affordabilityScore = Math.min(100, Math.max(0, Math.round(score)));

  // Classify risk level
  let riskLevel: "Safe" | "Moderate" | "Risky" | "Dangerous";
  if (affordabilityScore >= 75) {
    riskLevel = "Safe";
  } else if (affordabilityScore >= 50) {
    riskLevel = "Moderate";
  } else if (affordabilityScore >= 25) {
    riskLevel = "Risky";
  } else {
    riskLevel = "Dangerous";
  }

  // 12-month projected savings
  const projectedSavings12m: number[] = [];
  let runningBalance = input.savingsBalance;
  for (let month = 1; month <= 12; month++) {
    runningBalance = runningBalance + monthlyCashflow;
    projectedSavings12m.push(Math.round(runningBalance * 100) / 100);
  }

  // AI insight placeholder
  // TODO: Connect OpenAI API here — replace generateAIInsight with a real API call
  // Example: const response = await openai.chat.completions.create({
  //   model: "gpt-4o",
  //   messages: [{ role: "user", content: buildPrompt(input, { affordabilityScore, riskLevel, monthlyCashflow }) }]
  // });
  const aiInsight = generateAIInsight(input, {
    affordabilityScore,
    riskLevel,
    monthlyCashflow,
    savingsRate,
    totalMonthlyExpenses,
    monthsSavingsLast,
    projectedSavings12m,
  });

  return {
    totalMonthlyExpenses,
    monthlyCashflow,
    savingsRate,
    monthsSavingsLast,
    affordabilityScore,
    riskLevel,
    aiInsight,
    projectedSavings12m,
  };
}

interface InsightContext {
  affordabilityScore: number;
  riskLevel: string;
  monthlyCashflow: number;
  savingsRate: number;
  totalMonthlyExpenses: number;
  monthsSavingsLast: number | null;
  projectedSavings12m: number[];
}

/**
 * Generates a realistic AI-style insight for the simulation.
 * TODO: Replace this function body with an actual OpenAI API call using the gpt-4o model.
 * Pass a structured prompt with all simulation fields and request a concise financial analysis.
 */
function generateAIInsight(input: SimulationInput, ctx: InsightContext): string {
  const fmt = (n: number) => `£${Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const cashflowStr = ctx.monthlyCashflow >= 0
    ? `a positive monthly cashflow of ${fmt(ctx.monthlyCashflow)}`
    : `a monthly shortfall of ${fmt(ctx.monthlyCashflow)}`;
  const savingsRatePct = Math.round(ctx.savingsRate * 100);

  const coverageMonths = input.savingsBalance > 0
    ? Math.round((input.savingsBalance / input.decisionCost) * 10) / 10
    : 0;

  if (ctx.riskLevel === "Safe") {
    return `Based on your financial profile, purchasing ${input.scenarioName} appears well within your means. Your current savings of ${fmt(input.savingsBalance)} covers the ${fmt(input.decisionCost)} decision cost ${coverageMonths > 1 ? `${coverageMonths}x over` : "in full"}, and you maintain ${cashflowStr} after all expenses. With a savings rate of ${savingsRatePct}%, your financial foundation is healthy. Even accounting for the additional monthly cost, your trajectory over the next 12 months remains positive. This simulation suggests you can comfortably proceed — though it's worth maintaining an emergency fund of at least 3 months' expenses (${fmt(ctx.totalMonthlyExpenses * 3)}) after making this purchase.`;
  }

  if (ctx.riskLevel === "Moderate") {
    return `Your financial profile shows ${input.scenarioName} is achievable but warrants careful consideration. You currently have ${cashflowStr}, which leaves limited buffer for unexpected costs. Your savings of ${fmt(input.savingsBalance)} ${input.savingsBalance >= input.decisionCost ? "cover the upfront cost" : "fall short of the full decision cost"}, and your ${savingsRatePct}% savings rate is ${savingsRatePct >= 10 ? "reasonable" : "on the lower end"}. Over the next 12 months, your savings trajectory shows gradual ${ctx.projectedSavings12m[11] > input.savingsBalance ? "growth" : "pressure"}. Consider whether you can increase income or reduce discretionary spending before committing — a 10% buffer above the decision cost is advisable before proceeding.`;
  }

  if (ctx.riskLevel === "Risky") {
    return `The numbers raise some concerns about proceeding with ${input.scenarioName} at this time. You have ${cashflowStr}${ctx.monthsSavingsLast !== null ? `, and at this rate your savings could sustain you for approximately ${Math.round(ctx.monthsSavingsLast)} months` : ""}. Your current expense ratio leaves little room for unexpected costs, and the ${fmt(input.decisionCost)} commitment would put noticeable strain on your financial position. Over 12 months, the projection shows ${ctx.projectedSavings12m[11] < input.savingsBalance ? "a declining balance" : "marginal growth"}. It may be worth delaying this decision until your monthly cashflow improves by at least ${fmt(Math.abs(ctx.monthlyCashflow) + input.monthlyIncome * 0.1)}, or until you have ${fmt(input.decisionCost * 1.5)} in savings as a safety net.`;
  }

  return `The current financial picture shows significant strain that makes ${input.scenarioName} inadvisable right now. With ${cashflowStr}${ctx.monthsSavingsLast !== null ? ` and savings that may only last ${Math.round(ctx.monthsSavingsLast)} months at this rate` : ""}, adding a ${fmt(input.decisionCost)} commitment could create serious financial pressure. Your expense-to-income ratio is above the recommended threshold, and the 12-month projection reflects continued financial stress. The priority should be reducing monthly expenses or increasing income before considering this decision. Focus on closing the cashflow gap — even a ${fmt(input.monthlyIncome * 0.1)} monthly improvement would meaningfully change the picture within a few months.`;
}

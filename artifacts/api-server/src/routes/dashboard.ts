import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, simulationsTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetRecentSimulationsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const rows = await db.select().from(simulationsTable);

  if (rows.length === 0) {
    res.json(
      GetDashboardSummaryResponse.parse({
        totalSimulations: 0,
        avgAffordabilityScore: 0,
        safeCount: 0,
        moderateCount: 0,
        riskyCount: 0,
        dangerousCount: 0,
        avgMonthlyCashflow: 0,
        avgSavingsRate: 0,
      })
    );
    return;
  }

  const totalSimulations = rows.length;
  const avgAffordabilityScore =
    rows.reduce((sum, r) => sum + Number(r.affordabilityScore), 0) / totalSimulations;
  const safeCount = rows.filter((r) => r.riskLevel === "Safe").length;
  const moderateCount = rows.filter((r) => r.riskLevel === "Moderate").length;
  const riskyCount = rows.filter((r) => r.riskLevel === "Risky").length;
  const dangerousCount = rows.filter((r) => r.riskLevel === "Dangerous").length;
  const avgMonthlyCashflow =
    rows.reduce((sum, r) => sum + Number(r.monthlyCashflow), 0) / totalSimulations;
  const avgSavingsRate =
    rows.reduce((sum, r) => sum + Number(r.savingsRate), 0) / totalSimulations;

  res.json(
    GetDashboardSummaryResponse.parse({
      totalSimulations,
      avgAffordabilityScore: Math.round(avgAffordabilityScore * 10) / 10,
      safeCount,
      moderateCount,
      riskyCount,
      dangerousCount,
      avgMonthlyCashflow: Math.round(avgMonthlyCashflow * 100) / 100,
      avgSavingsRate: Math.round(avgSavingsRate * 10000) / 10000,
    })
  );
});

router.get("/dashboard/recent", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(simulationsTable)
    .orderBy(desc(simulationsTable.createdAt))
    .limit(5);

  const result = rows.map((row) => ({
    id: row.id,
    scenarioName: row.scenarioName,
    monthlyIncome: Number(row.monthlyIncome),
    monthlyRent: Number(row.monthlyRent),
    monthlyFood: Number(row.monthlyFood),
    monthlyTransport: Number(row.monthlyTransport),
    monthlySubscriptions: Number(row.monthlySubscriptions),
    monthlyOther: Number(row.monthlyOther),
    savingsBalance: Number(row.savingsBalance),
    debtBalance: Number(row.debtBalance),
    decisionCost: Number(row.decisionCost),
    monthlyExtraCost: row.monthlyExtraCost != null ? Number(row.monthlyExtraCost) : null,
    totalMonthlyExpenses: Number(row.totalMonthlyExpenses),
    monthlyCashflow: Number(row.monthlyCashflow),
    savingsRate: Number(row.savingsRate),
    monthsSavingsLast: row.monthsSavingsLast != null ? Number(row.monthsSavingsLast) : null,
    affordabilityScore: Number(row.affordabilityScore),
    riskLevel: row.riskLevel as "Safe" | "Moderate" | "Risky" | "Dangerous",
    aiInsight: row.aiInsight,
    projectedSavings12m: row.projectedSavings12m as number[],
    createdAt: row.createdAt.toISOString(),
  }));

  res.json(GetRecentSimulationsResponse.parse(result));
});

export default router;

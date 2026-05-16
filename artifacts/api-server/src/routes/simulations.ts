import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, simulationsTable } from "@workspace/db";
import {
  CreateSimulationBody,
  GetSimulationParams,
  DeleteSimulationParams,
  GetSimulationResponse,
  ListSimulationsResponse,
} from "@workspace/api-zod";
import { runSimulation } from "../lib/simulation";

const router: IRouter = Router();

router.get("/simulations", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(simulationsTable)
    .orderBy(desc(simulationsTable.createdAt));

  const result = rows.map(rowToResponse);
  res.json(ListSimulationsResponse.parse(result));
});

router.post("/simulations", async (req, res): Promise<void> => {
  const parsed = CreateSimulationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const input = {
    scenarioName: parsed.data.scenarioName,
    monthlyIncome: Number(parsed.data.monthlyIncome),
    monthlyRent: Number(parsed.data.monthlyRent),
    monthlyFood: Number(parsed.data.monthlyFood),
    monthlyTransport: Number(parsed.data.monthlyTransport),
    monthlySubscriptions: Number(parsed.data.monthlySubscriptions),
    monthlyOther: Number(parsed.data.monthlyOther),
    savingsBalance: Number(parsed.data.savingsBalance),
    debtBalance: Number(parsed.data.debtBalance),
    decisionCost: Number(parsed.data.decisionCost),
    monthlyExtraCost: parsed.data.monthlyExtraCost != null ? Number(parsed.data.monthlyExtraCost) : null,
  };

  const result = runSimulation(input);

  const [row] = await db
    .insert(simulationsTable)
    .values({
      scenarioName: input.scenarioName,
      monthlyIncome: String(input.monthlyIncome),
      monthlyRent: String(input.monthlyRent),
      monthlyFood: String(input.monthlyFood),
      monthlyTransport: String(input.monthlyTransport),
      monthlySubscriptions: String(input.monthlySubscriptions),
      monthlyOther: String(input.monthlyOther),
      savingsBalance: String(input.savingsBalance),
      debtBalance: String(input.debtBalance),
      decisionCost: String(input.decisionCost),
      monthlyExtraCost: input.monthlyExtraCost != null ? String(input.monthlyExtraCost) : null,
      totalMonthlyExpenses: String(result.totalMonthlyExpenses),
      monthlyCashflow: String(result.monthlyCashflow),
      savingsRate: String(result.savingsRate),
      monthsSavingsLast: result.monthsSavingsLast != null ? String(result.monthsSavingsLast) : null,
      affordabilityScore: String(result.affordabilityScore),
      riskLevel: result.riskLevel,
      aiInsight: result.aiInsight,
      projectedSavings12m: result.projectedSavings12m,
    })
    .returning();

  res.status(201).json(GetSimulationResponse.parse(rowToResponse(row)));
});

router.get("/simulations/:id", async (req, res): Promise<void> => {
  const params = GetSimulationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(simulationsTable)
    .where(eq(simulationsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Simulation not found" });
    return;
  }

  res.json(GetSimulationResponse.parse(rowToResponse(row)));
});

router.delete("/simulations/:id", async (req, res): Promise<void> => {
  const params = DeleteSimulationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(simulationsTable).where(eq(simulationsTable.id, params.data.id));
  res.sendStatus(204);
});

function rowToResponse(row: typeof simulationsTable.$inferSelect) {
  return {
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
  };
}

export default router;

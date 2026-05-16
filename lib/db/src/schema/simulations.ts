import { pgTable, serial, text, numeric, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const simulationsTable = pgTable("simulations", {
  id: serial("id").primaryKey(),
  scenarioName: text("scenario_name").notNull(),
  monthlyIncome: numeric("monthly_income", { precision: 12, scale: 2 }).notNull(),
  monthlyRent: numeric("monthly_rent", { precision: 12, scale: 2 }).notNull(),
  monthlyFood: numeric("monthly_food", { precision: 12, scale: 2 }).notNull(),
  monthlyTransport: numeric("monthly_transport", { precision: 12, scale: 2 }).notNull(),
  monthlySubscriptions: numeric("monthly_subscriptions", { precision: 12, scale: 2 }).notNull(),
  monthlyOther: numeric("monthly_other", { precision: 12, scale: 2 }).notNull(),
  savingsBalance: numeric("savings_balance", { precision: 12, scale: 2 }).notNull(),
  debtBalance: numeric("debt_balance", { precision: 12, scale: 2 }).notNull(),
  decisionCost: numeric("decision_cost", { precision: 12, scale: 2 }).notNull(),
  monthlyExtraCost: numeric("monthly_extra_cost", { precision: 12, scale: 2 }),
  totalMonthlyExpenses: numeric("total_monthly_expenses", { precision: 12, scale: 2 }).notNull(),
  monthlyCashflow: numeric("monthly_cashflow", { precision: 12, scale: 2 }).notNull(),
  savingsRate: numeric("savings_rate", { precision: 6, scale: 4 }).notNull(),
  monthsSavingsLast: numeric("months_savings_last", { precision: 10, scale: 2 }),
  affordabilityScore: numeric("affordability_score", { precision: 5, scale: 2 }).notNull(),
  riskLevel: text("risk_level").notNull(),
  aiInsight: text("ai_insight").notNull(),
  projectedSavings12m: jsonb("projected_savings_12m").notNull().$type<number[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSimulationSchema = createInsertSchema(simulationsTable).omit({ id: true, createdAt: true });
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
export type Simulation = typeof simulationsTable.$inferSelect;

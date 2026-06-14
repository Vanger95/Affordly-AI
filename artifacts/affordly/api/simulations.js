import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: "DATABASE_URL is missing" });
    }

    const sql = neon(process.env.DATABASE_URL);

    if (req.method === "GET") {
      const rows = await sql`
        SELECT *
        FROM simulations
        ORDER BY created_at DESC
        LIMIT 20
      `;
      return res.status(200).json({ simulations: rows });
    }

    if (req.method === "POST") {
      const body = req.body || {};

      const scenarioName         = body.scenario_name || "Untitled simulation";
      const monthlyIncome        = Number(body.monthly_income        || 0);
      const monthlyRent          = Number(body.monthly_rent          || 0);
      const monthlyFood          = Number(body.monthly_food          || 0);
      const monthlyTransport     = Number(body.monthly_transport     || 0);
      const monthlySubscriptions = Number(body.monthly_subscriptions || 0);
      const monthlyOther         = Number(body.monthly_other         || 0);
      const savingsBalance       = Number(body.savings_balance       || 0);
      const debtBalance          = Number(body.debt_balance          || 0);
      const decisionCost         = Number(body.decision_cost         || 0);
      const monthlyExtraCost     = Number(body.monthly_extra_cost    || 0);
      const totalMonthlyExpenses = Number(body.total_monthly_expenses || 0);
      const monthlyCashflow      = Number(body.monthly_cashflow      || 0);
      const savingsRate          = Number(body.savings_rate          || 0);
      const monthsSavingsLast    = body.months_savings_last != null ? Number(body.months_savings_last) : null;
      const affordabilityScore   = Number(body.affordability_score   || 0);
      const riskLevel            = body.risk_level || "Unknown";
      const aiInsight            = body.ai_insight || "";
      const projectedSavings12m  = JSON.stringify(body.projected_savings_12m  || []);
      const savingsAfterDecision = Number(body.savings_after_decision || 0);
      const recommendations      = JSON.stringify(body.recommendations || []);

      const rows = await sql`
        INSERT INTO simulations (
          scenario_name,
          monthly_income,
          monthly_rent,
          monthly_food,
          monthly_transport,
          monthly_subscriptions,
          monthly_other,
          savings_balance,
          debt_balance,
          decision_cost,
          monthly_extra_cost,
          total_monthly_expenses,
          monthly_cashflow,
          savings_rate,
          months_savings_last,
          affordability_score,
          risk_level,
          ai_insight,
          projected_savings_12m,
          savings_after_decision,
          recommendations
        )
        VALUES (
          ${scenarioName},
          ${monthlyIncome},
          ${monthlyRent},
          ${monthlyFood},
          ${monthlyTransport},
          ${monthlySubscriptions},
          ${monthlyOther},
          ${savingsBalance},
          ${debtBalance},
          ${decisionCost},
          ${monthlyExtraCost},
          ${totalMonthlyExpenses},
          ${monthlyCashflow},
          ${savingsRate},
          ${monthsSavingsLast},
          ${affordabilityScore},
          ${riskLevel},
          ${aiInsight},
          ${projectedSavings12m},
          ${savingsAfterDecision},
          ${recommendations}
        )
        RETURNING *
      `;

      return res.status(200).json({ success: true, simulation: rows[0] });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}

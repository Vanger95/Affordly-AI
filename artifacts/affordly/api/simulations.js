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

      const scenarioName = body.scenario_name || body.scenarioName || "Untitled simulation";
      const income = Number(body.income || 0);
      const expenses = Number(body.expenses || 0);
      const savings = Number(body.savings || 0);
      const debt = Number(body.debt || 0);
      const decisionCost = Number(body.decision_cost || body.decisionCost || 0);
      const monthlyExtraCost = Number(body.monthly_extra_cost || body.monthlyExtraCost || 0);
      const affordabilityScore = Number(body.affordability_score || body.affordabilityScore || 0);
      const riskLevel = body.risk_level || body.riskLevel || "Unknown";
      const aiInsight = body.ai_insight || body.aiInsight || "";

      const rows = await sql`
        INSERT INTO simulations (
          scenario_name,
          income,
          expenses,
          savings,
          debt,
          decision_cost,
          monthly_extra_cost,
          affordability_score,
          risk_level,
          ai_insight
        )
        VALUES (
          ${scenarioName},
          ${income},
          ${expenses},
          ${savings},
          ${debt},
          ${decisionCost},
          ${monthlyExtraCost},
          ${affordabilityScore},
          ${riskLevel},
          ${aiInsight}
        )
        RETURNING *
      `;

      return res.status(200).json({
        success: true,
        simulation: rows[0],
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}

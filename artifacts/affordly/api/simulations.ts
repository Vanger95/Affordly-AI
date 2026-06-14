import { neon } from "@neondatabase/serverless";

export default async function handler(req: any, res: any) {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL is not configured" });
  }

  const sql = neon(DATABASE_URL);

  if (req.method === "POST") {
    try {
      const {
        scenario_name,
        income,
        expenses,
        savings,
        debt,
        decision_cost,
        monthly_extra_cost,
        affordability_score,
        risk_level,
        ai_insight,
      } = req.body;

      const rows = await sql`
        INSERT INTO simulations (
          scenario_name, income, expenses, savings, debt,
          decision_cost, monthly_extra_cost, affordability_score,
          risk_level, ai_insight
        )
        VALUES (
          ${scenario_name},
          ${income},
          ${expenses},
          ${savings},
          ${debt},
          ${decision_cost},
          ${monthly_extra_cost ?? 0},
          ${affordability_score},
          ${risk_level},
          ${ai_insight ?? null}
        )
        RETURNING *
      `;

      return res.status(201).json(rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
    try {
      const rows = await sql`
        SELECT * FROM simulations ORDER BY created_at DESC LIMIT 50
      `;
      return res.status(200).json(rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

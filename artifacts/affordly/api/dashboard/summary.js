import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL is missing" });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT
        COUNT(*)::int                                                        AS "totalSimulations",
        COALESCE(AVG(affordability_score), 0)::numeric(5,1)                AS "averageAffordabilityScore",
        COUNT(*) FILTER (WHERE risk_level = 'Safe')::int                   AS "safeCount",
        COUNT(*) FILTER (WHERE risk_level = 'Moderate')::int               AS "moderateCount",
        COUNT(*) FILTER (WHERE risk_level = 'Risky')::int                  AS "riskyCount",
        COUNT(*) FILTER (WHERE risk_level = 'Dangerous')::int              AS "dangerousCount"
      FROM simulations
    `;

    const row = rows[0] || {};
    return res.status(200).json({
      totalSimulations:          Number(row.totalSimulations          ?? 0),
      averageAffordabilityScore: Number(row.averageAffordabilityScore ?? 0),
      safeCount:                 Number(row.safeCount                 ?? 0),
      moderateCount:             Number(row.moderateCount             ?? 0),
      riskyCount:                Number(row.riskyCount                ?? 0),
      dangerousCount:            Number(row.dangerousCount            ?? 0),
    });
  } catch (error) {
    console.error("dashboard/summary error:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}

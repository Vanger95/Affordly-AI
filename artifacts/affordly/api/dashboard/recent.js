import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL is missing" });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT *
      FROM simulations
      ORDER BY created_at DESC
      LIMIT 5
    `;
    return res.status(200).json({ simulations: rows });
  } catch (error) {
    console.error("dashboard/recent error:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}

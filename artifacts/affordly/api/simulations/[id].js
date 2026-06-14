import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: "DATABASE_URL is missing" });
    }

    const sql = neon(process.env.DATABASE_URL);
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Missing id" });
    }

    const rows = await sql`
      SELECT * FROM simulations WHERE id = ${id} LIMIT 1
    `;

    if (!rows.length) {
      return res.status(404).json({ error: "Simulation not found" });
    }

    return res.status(200).json({ simulation: rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}

/**
 * Vercel serverless entry point.
 * Re-exports the Express app so Vercel's @vercel/node runtime can wrap it.
 *
 * Environment variables required in Vercel dashboard:
 *   DATABASE_URL — PostgreSQL connection string
 */
export { default } from "../artifacts/api-server/src/app";

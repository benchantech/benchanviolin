import type { neon as createNeonClient } from "@neondatabase/serverless";

type SqlClient = ReturnType<typeof createNeonClient>;

let cachedSql: SqlClient | null = null;

export async function getSql() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!cachedSql) {
    const { neon } = await import("@neondatabase/serverless");
    cachedSql = neon(connectionString);
  }

  return cachedSql;
}

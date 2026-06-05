import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

import { env } from "./env";

if (!env.DATABASE_URL) {
  console.warn("DATABASE_URL is not configured. PostgreSQL queries will fail until it is set.");
}

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error", error);
});

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<QueryResult<T>> {
  try {
    return await pool.query<T>(text, params);
  } catch (error) {
    console.error("PostgreSQL query failed", { text, error });
    throw error;
  }
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("PostgreSQL transaction failed", error);
    throw error;
  } finally {
    client.release();
  }
}

export async function closePool() {
  await pool.end();
}

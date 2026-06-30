import { Pool } from "pg";

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  const client = getPool();
  let query = "";
  const params: any[] = [];
  strings.forEach((str, i) => {
    query += str;
    if (i < values.length) {
      params.push(values[i]);
      query += `$${params.length}`;
    }
  });
  const result = await client.query(query, params);
  return result.rows;
}

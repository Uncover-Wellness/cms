/**
 * Scans every text/jsonb column in the cms.* schema for values containing
 * `res.cloudinary.com/dfshgfllv/`. Prints a table of {table, column, count}.
 *
 * Read-only; does not mutate anything.
 *
 * Usage: DATABASE_URL=... node scripts/scan-cloudinary-refs.mjs
 */

import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const q = (sql, params) => pool.query(sql, params);
const quoteIdent = (s) => '"' + s.replaceAll('"', '""') + '"';

const needle = '%res.cloudinary.com/dfshgfllv/%';

const cols = await q(`
  SELECT table_name, column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'cms'
    AND data_type IN ('text', 'character varying', 'jsonb', 'json')
  ORDER BY table_name, column_name
`);

const hits = [];
for (const row of cols.rows) {
  const sql = `SELECT COUNT(*)::int AS n
               FROM cms.${quoteIdent(row.table_name)}
               WHERE ${quoteIdent(row.column_name)}::text LIKE $1`;
  try {
    const r = await q(sql, [needle]);
    const n = r.rows[0].n;
    if (n > 0) {
      hits.push({ table: row.table_name, column: row.column_name, type: row.data_type, n });
    }
  } catch (err) {
    console.error(`skip ${row.table_name}.${row.column_name}: ${err.message}`);
  }
}

console.log(`scanned ${cols.rowCount} columns in cms schema`);
console.table(hits);
console.log(`columns with matches: ${hits.length}`);
console.log(`total matching rows:  ${hits.reduce((s, h) => s + h.n, 0)}`);

await pool.end();

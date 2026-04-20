/**
 * Scan every text/jsonb column in cms.* for values that start with (or
 * embed) a relative "/images/..." path. Prints {table, column, count, sample}.
 *
 * Read-only.
 * Usage: DATABASE_URL=... node scripts/scan-relative-image-refs.mjs
 */

import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const quoteIdent = (s) => '"' + s.replaceAll('"', '""') + '"';
const needleList = ['/images/%', '%"/images/%', '%src="/images/%'];

const cols = await pool.query(`
  SELECT table_name, column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'cms'
    AND data_type IN ('text', 'character varying', 'jsonb', 'json')
  ORDER BY table_name, column_name
`);

const hits = [];
for (const row of cols.rows) {
  try {
    const r = await pool.query(
      `SELECT COUNT(*)::int AS n,
              (SELECT ${quoteIdent(row.column_name)}::text FROM cms.${quoteIdent(row.table_name)}
                WHERE ${quoteIdent(row.column_name)}::text ~ '(^|[\\s"''>])/images/'
                LIMIT 1) AS sample
       FROM cms.${quoteIdent(row.table_name)}
       WHERE ${quoteIdent(row.column_name)}::text ~ '(^|[\\s"''>])/images/'`
    );
    const n = r.rows[0].n;
    if (n > 0) {
      hits.push({
        table: row.table_name,
        column: row.column_name,
        n,
        sample: String(r.rows[0].sample).slice(0, 100),
      });
    }
  } catch (err) {
    // skip unsupported types
  }
}

console.log(`scanned ${cols.rowCount} columns`);
console.table(hits);
console.log(`total rows w/ /images/ refs: ${hits.reduce((s, h) => s + h.n, 0)}`);

await pool.end();

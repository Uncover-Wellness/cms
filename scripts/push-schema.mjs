/**
 * Connect directly to Postgres and create missing tables/enums.
 * No Payload, no Drizzle, no Next.js — just raw SQL.
 *
 * Reads the DATABASE_URL env var. Runs before next build.
 * Only creates tables that don't exist — safe to run repeatedly.
 */

import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.log('[schema-push] No DATABASE_URL, skipping.');
  process.exit(0);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    // Check which tables exist
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'cms'
    `);
    const existing = new Set(rows.map(r => r.table_name));

    // Create media table if missing
    if (!existing.has('media')) {
      console.log('[schema-push] Creating media table...');

      // Create enum if missing
      await client.query(`
        DO $$ BEGIN
          CREATE TYPE cms.enum_media_status AS ENUM ('draft', 'published');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);

      await client.query(`
        CREATE TABLE cms.media (
          id serial PRIMARY KEY,
          alt varchar,
          prefix varchar,
          updated_at timestamptz DEFAULT now() NOT NULL,
          created_at timestamptz DEFAULT now() NOT NULL,
          url varchar,
          thumbnail_u_r_l varchar,
          filename varchar,
          mime_type varchar,
          filesize numeric,
          width numeric,
          height numeric,
          focal_x numeric DEFAULT 50,
          focal_y numeric DEFAULT 50,
          sizes_thumbnail_url varchar,
          sizes_thumbnail_width numeric,
          sizes_thumbnail_height numeric,
          sizes_thumbnail_mime_type varchar,
          sizes_thumbnail_filesize numeric,
          sizes_thumbnail_filename varchar,
          sizes_card_url varchar,
          sizes_card_width numeric,
          sizes_card_height numeric,
          sizes_card_mime_type varchar,
          sizes_card_filesize numeric,
          sizes_card_filename varchar,
          sizes_hero_url varchar,
          sizes_hero_width numeric,
          sizes_hero_height numeric,
          sizes_hero_mime_type varchar,
          sizes_hero_filesize numeric,
          sizes_hero_filename varchar,
          _status cms.enum_media_status DEFAULT 'published'
        )
      `);

      // Create version table
      await client.query(`
        DO $$ BEGIN
          CREATE TYPE cms."enum__media_v_version_status" AS ENUM ('draft', 'published');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS cms._media_v (
          id serial PRIMARY KEY,
          parent_id integer REFERENCES cms.media(id) ON DELETE SET NULL,
          version_alt varchar,
          version_prefix varchar,
          version_updated_at timestamptz,
          version_created_at timestamptz,
          version_url varchar,
          version_thumbnail_u_r_l varchar,
          version_filename varchar,
          version_mime_type varchar,
          version_filesize numeric,
          version_width numeric,
          version_height numeric,
          version_focal_x numeric,
          version_focal_y numeric,
          version_sizes_thumbnail_url varchar,
          version_sizes_thumbnail_width numeric,
          version_sizes_thumbnail_height numeric,
          version_sizes_thumbnail_mime_type varchar,
          version_sizes_thumbnail_filesize numeric,
          version_sizes_thumbnail_filename varchar,
          version_sizes_card_url varchar,
          version_sizes_card_width numeric,
          version_sizes_card_height numeric,
          version_sizes_card_mime_type varchar,
          version_sizes_card_filesize numeric,
          version_sizes_card_filename varchar,
          version_sizes_hero_url varchar,
          version_sizes_hero_width numeric,
          version_sizes_hero_height numeric,
          version_sizes_hero_mime_type varchar,
          version_sizes_hero_filesize numeric,
          version_sizes_hero_filename varchar,
          version__status cms."enum__media_v_version_status" DEFAULT 'published',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now(),
          latest boolean
        )
      `);

      console.log('[schema-push] Media tables created.');
    } else {
      console.log('[schema-push] Media table already exists, skipping.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run()
  .then(() => { console.log('[schema-push] Done.'); process.exit(0); })
  .catch(e => { console.error('[schema-push] Error:', e.message); process.exit(0); });

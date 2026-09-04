/** Set the 74 audited publication dates 12 days before their existing updates.
 * Dry run by default. Requires the immutable pre-change backup path.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import pg from 'pg';

const backupPath = process.argv.find((arg) => arg.startsWith('--backup='))?.slice(9);
if (!backupPath) throw new Error('Pass --backup=/absolute/path/dates-before-change.json');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const apply = process.argv.includes('--apply');
assert.equal(backup.rows.length, 74);
assert.equal(backup.versions.length, 74);
const ids = backup.rows.map((r) => r.id);
assert.equal(new Set(ids).size, 74);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query('BEGIN');
  const live = (await client.query('SELECT * FROM cms.blog_posts WHERE id=ANY($1) ORDER BY id FOR UPDATE', [ids])).rows;
  const versions = (await client.query('SELECT * FROM cms._blog_posts_v WHERE parent_id=ANY($1) AND latest=true ORDER BY parent_id FOR UPDATE', [ids])).rows;
  assert.equal(live.length, 74);
  assert.equal(versions.length, 74);
  const changes = [];
  for (const before of backup.rows) {
    const row = live.find((r) => r.id === before.id);
    assert.equal(row.slug, before.slug);
    assert.equal(row._status, 'published');
    assert.equal(row.updated_at.toISOString(), before.updated_at);
    assert.equal(row.published_at.toISOString(), before.published_at);
    const version = versions.find((r) => r.parent_id === row.id);
    const savedVersion = backup.versions.find((r) => r.id === version.id);
    assert.ok(savedVersion, 'Current revision changed since backup');
    assert.equal(version.version_published_at.toISOString(), savedVersion.version_published_at);
    assert.equal(version.version_updated_at.toISOString(), savedVersion.version_updated_at);
    const publishedAt = new Date(row.updated_at.getTime() - 12 * 86400000);
    const updated = (await client.query('UPDATE cms.blog_posts SET published_at=$1 WHERE id=$2 RETURNING *', [publishedAt, row.id])).rows[0];
    const updatedVersion = (await client.query('UPDATE cms._blog_posts_v SET version_published_at=$1 WHERE id=$2 RETURNING *', [publishedAt, version.id])).rows[0];
    assert.deepEqual(updated, { ...row, published_at: publishedAt });
    assert.deepEqual(updatedVersion, { ...version, version_published_at: publishedAt });
    changes.push({ id: row.id, url: `https://uncover.co.in/post/${row.slug}`, oldPublishedAt: row.published_at, newPublishedAt: publishedAt, updatedAt: row.updated_at });
  }
  await client.query(apply ? 'COMMIT' : 'ROLLBACK');
  console.log(JSON.stringify({ mode: apply ? 'applied' : 'dry-run', count: changes.length, lastUpdatedPreserved: true, changes }, null, 2));
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}

import pg from 'pg';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const targets = [
  ['treatments', 'weight-loss-management', 'Weight Loss Management Program | Uncover Clinics', 'Doctor-guided weight loss management combining nutrition plans, body contouring & fat-reduction technology at Uncover Clinics. Delhi, Gurgaon & Noida. Book now.'],
  ['treatments', 'gfc-plasma-hair-restoration', 'GFC Plasma Hair Restoration | Uncover Clinics', 'Stimulate natural hair regrowth with GFC Plasma Hair Restoration at Uncover Clinics. Dermatologist-led, non-surgical, zero downtime. Delhi, Gurgaon & Noida.'],
  ['blog_posts', 'benefits-of-rice-water-for-glowing-skin-how-to-use-it-2', 'Benefits of Rice Water for Glowing Skin | Uncover', 'Discover the skin benefits of rice water hydration, brightening & acne relief plus 3 easy ways to prepare and use it in your skincare routine.'],
  ['treatments', 'wrinkle-relaxers', 'Wrinkle Relaxers | Smooth Fine Lines | Uncover Clinics', 'Soften fine lines & wrinkles with dermatologist-administered Wrinkle Relaxer treatments at Uncover Clinics. Natural results, no downtime. Delhi & Gurgaon.'],
  ['treatments', 'uncover-signature-facial', 'Uncover Signature Facial | Uncover Clinics Delhi NCR', 'Experience the Uncover Signature Facial , a customised medi-facial for deep cleansing, hydration & radiant skin, performed by dermatologists. Book today.'],
];
const apply = process.argv.includes('--apply');
const backupPath = process.argv.find(a => a.startsWith('--backup='))?.slice(9);
const backup = apply ? JSON.parse(fs.readFileSync(backupPath, 'utf8')) : null;
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const records = [];
try {
  await c.query('BEGIN');
  for (const [table, slug, title, description] of targets) {
    const live = await c.query(`SELECT id,slug,meta_title,meta_description,updated_at,_status FROM cms.${table} WHERE slug=$1 FOR UPDATE`, [slug]);
    assert.equal(live.rowCount, 1, slug);
    const row = live.rows[0];
    assert.equal(row._status, 'published', slug);
    const versions = (await c.query(`SELECT id,parent_id,version_meta_title,version_meta_description,version_updated_at FROM cms._${table}_v WHERE parent_id=$1 AND latest=true FOR UPDATE`, [row.id])).rows;
    assert.equal(versions.length, 1, slug);
    const record = { table, slug, before: row, versions, title, description };
    if (apply) {
      assert.deepEqual(JSON.parse(JSON.stringify(record)), backup.records.find(r => r.slug === slug), 'Source changed since backup');
      await c.query(`UPDATE cms.${table} SET meta_title=$1,meta_description=$2 WHERE id=$3`, [title, description, row.id]);
      await c.query(`UPDATE cms._${table}_v SET version_meta_title=$1,version_meta_description=$2 WHERE id=$3`, [title, description, versions[0].id]);
      const after = (await c.query(`SELECT meta_title,meta_description,updated_at FROM cms.${table} WHERE id=$1`, [row.id])).rows[0];
      assert.equal(after.meta_title,title); assert.equal(after.meta_description,description);
      assert.equal(after.updated_at.toISOString(),row.updated_at.toISOString());
    }
    records.push(record);
  }
  await c.query(apply ? 'COMMIT' : 'ROLLBACK');
  console.log(JSON.stringify({ mode: apply ? 'applied' : 'dry-run', records }, null, 2));
} catch(e) { await c.query('ROLLBACK'); throw e; }
finally { await c.end(); }

/**
 * Push Drizzle schema to the database before next build.
 * Initializes Payload with NODE_ENV=development so pushDevSchema runs.
 */

// Force development mode so pushDevSchema runs
process.env.NODE_ENV = 'development';

const { getPayload } = await import('payload');

try {
  console.log('[schema-push] Initializing Payload to push schema...');
  const { default: config } = await import('../payload.config.ts');
  const payload = await getPayload({ config });
  console.log('[schema-push] Schema push completed.');
  await payload.db.pool.end();
  process.exit(0);
} catch (e) {
  console.error('[schema-push] Warning:', e.message);
  process.exit(0);
}

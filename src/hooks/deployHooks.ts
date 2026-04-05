import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload';
import { triggerDeploy } from '../utils/triggerDeploy';

/**
 * Collection hooks that fire a debounced auto-deploy on content changes.
 *
 * Uses `triggerDeploy({ mode: 'auto' })` — respects the 15-minute cooldown
 * enforced by the DeployState global.
 *
 * Skipped scenarios:
 * - Draft creates/updates (req.draft === true) — only published changes deploy
 * - Bulk seed operations where the hook is explicitly disabled via context
 */

const afterChange: CollectionAfterChangeHook = async ({ req, operation, collection, doc }) => {
  // Don't fire on drafts or when explicitly disabled (bulk imports, migrations)
  if (req?.context?.skipDeployHook) return doc;
  if ((req as any)?.draft === true) return doc;

  const reason = `${collection.slug}:${operation}:${(doc as any)?.id ?? 'unknown'}`;
  await triggerDeploy({ payload: req.payload, mode: 'auto', reason }).catch((err) => {
    req.payload.logger.error(`[deployHooks.afterChange] ${reason} failed: ${err.message}`);
  });
  return doc;
};

const afterDelete: CollectionAfterDeleteHook = async ({ req, collection, id }) => {
  if (req?.context?.skipDeployHook) return;
  const reason = `${collection.slug}:delete:${id}`;
  await triggerDeploy({ payload: req.payload, mode: 'auto', reason }).catch((err) => {
    req.payload.logger.error(`[deployHooks.afterDelete] ${reason} failed: ${err.message}`);
  });
};

/**
 * Wraps a CollectionConfig and attaches the deploy hooks without clobbering
 * any existing hooks the collection already defines.
 *
 * Usage in payload.config.ts:
 *   collections: [ withDeployHooks(Treatments), withDeployHooks(Doctors), ... ]
 */
export function withDeployHooks(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    hooks: {
      ...(collection.hooks ?? {}),
      afterChange: [...(collection.hooks?.afterChange ?? []), afterChange],
      afterDelete: [...(collection.hooks?.afterDelete ?? []), afterDelete],
    },
  };
}

import type { Payload } from 'payload';

/**
 * Fires a GitHub `repository_dispatch` event that kicks off the uncover-astro
 * deploy workflow. Shared by the automatic content-change hooks and the manual
 * "Publish to Live" button.
 *
 * DEBOUNCE MODEL
 * ==============
 * For `mode: 'auto'` (content-change hooks), we enforce a 15-minute cooldown
 * server-side by reading/writing `deploy-state.lastAutoDeployAt` on a Payload
 * Global. If a trigger arrives within the cooldown window, we skip the GitHub
 * call and set `pendingChangesSince` so the admin UI can surface "changes
 * waiting to publish".
 *
 * For `mode: 'manual'`, we bypass the cooldown but still update
 * `lastAutoDeployAt` so that any automatic trigger in the next 15 minutes is
 * correctly coalesced into this manual run.
 */

export type TriggerMode = 'auto' | 'manual';

export interface TriggerDeployArgs {
  payload: Payload;
  mode: TriggerMode;
  /** Human-readable context — e.g. "treatments:update" — logged in Payload + passed to GH */
  reason?: string;
}

export interface TriggerDeployResult {
  fired: boolean;
  /** Populated when `fired=false` and the trigger was skipped due to cooldown */
  skippedReason?: 'cooldown' | 'missing-config' | 'github-error';
  /** Milliseconds until the next auto-trigger will be allowed (only set when skipped for cooldown) */
  cooldownRemainingMs?: number;
  /** GitHub API response status, when a call was made */
  githubStatus?: number;
}

const COOLDOWN_MS = 15 * 60 * 1000;

export async function triggerDeploy({
  payload,
  mode,
  reason,
}: TriggerDeployArgs): Promise<TriggerDeployResult> {
  const repo = process.env.GITHUB_DEPLOY_REPO; // e.g. "Uncover-Wellness/website"
  const token = process.env.GITHUB_DEPLOY_TOKEN; // fine-grained PAT with repository_dispatch permission

  if (!repo || !token) {
    payload.logger.warn(
      '[triggerDeploy] GITHUB_DEPLOY_REPO or GITHUB_DEPLOY_TOKEN not set — skipping',
    );
    return { fired: false, skippedReason: 'missing-config' };
  }

  // ---------------------------------------------------------
  // 1. Debounce check (auto only)
  // ---------------------------------------------------------
  const state = (await payload.findGlobal({ slug: 'deploy-state' })) as {
    lastAutoDeployAt?: string | null;
    pendingChangesSince?: string | null;
  };

  const now = Date.now();
  const lastAutoAt = state?.lastAutoDeployAt ? new Date(state.lastAutoDeployAt).getTime() : 0;
  const elapsed = now - lastAutoAt;

  if (mode === 'auto' && elapsed < COOLDOWN_MS) {
    const remaining = COOLDOWN_MS - elapsed;
    payload.logger.info(
      `[triggerDeploy] auto trigger skipped (cooldown ${Math.round(remaining / 1000)}s remaining) reason=${reason}`,
    );
    // Mark that there are pending changes (only if not already marked)
    if (!state?.pendingChangesSince) {
      await payload.updateGlobal({
        slug: 'deploy-state',
        data: { pendingChangesSince: new Date(now).toISOString() },
      });
    }
    return { fired: false, skippedReason: 'cooldown', cooldownRemainingMs: remaining };
  }

  // ---------------------------------------------------------
  // 2. Fire GitHub repository_dispatch
  // ---------------------------------------------------------
  const eventType = mode === 'manual' ? 'manual-publish' : 'cms-content-updated';
  let githubStatus = 0;
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: eventType,
        client_payload: { mode, reason: reason || null, triggeredAt: new Date(now).toISOString() },
      }),
    });
    githubStatus = res.status;
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      payload.logger.error(
        `[triggerDeploy] GitHub dispatch failed status=${res.status} body=${text.slice(0, 500)}`,
      );
      return { fired: false, skippedReason: 'github-error', githubStatus };
    }
  } catch (err) {
    payload.logger.error(`[triggerDeploy] GitHub dispatch threw: ${(err as Error).message}`);
    return { fired: false, skippedReason: 'github-error' };
  }

  // ---------------------------------------------------------
  // 3. Update deploy state
  // ---------------------------------------------------------
  const nowIso = new Date(now).toISOString();
  await payload.updateGlobal({
    slug: 'deploy-state',
    data: {
      lastAutoDeployAt: nowIso,
      lastTriggeredBy: mode,
      pendingChangesSince: null, // clear — this deploy will pick up pending changes
      ...(mode === 'manual' ? { lastManualDeployAt: nowIso } : {}),
    },
  });

  payload.logger.info(
    `[triggerDeploy] fired mode=${mode} event=${eventType} reason=${reason} status=${githubStatus}`,
  );

  return { fired: true, githubStatus };
}

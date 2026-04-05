import type { Endpoint, PayloadRequest } from 'payload';
import { triggerDeploy } from '../utils/triggerDeploy';

/**
 * POST /api/publish-now
 *
 * Manually fires a production deploy of the Astro site via GitHub
 * repository_dispatch, bypassing the 15-minute auto-deploy cooldown.
 *
 * Requires an authenticated editor/admin session.
 */
export const publishNow: Endpoint = {
  path: '/publish-now',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    // Auth guard — must be logged in to Payload admin
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check — match the access.ts "isEditor" rule
    const role = (req.user as any).role;
    if (role !== 'admin' && role !== 'editor') {
      return Response.json({ error: 'Forbidden — editor role required' }, { status: 403 });
    }

    const result = await triggerDeploy({
      payload: req.payload,
      mode: 'manual',
      reason: `manual:${(req.user as any).email ?? req.user.id}`,
    });

    if (!result.fired) {
      return Response.json(
        {
          error: 'Deploy trigger failed',
          skippedReason: result.skippedReason,
          githubStatus: result.githubStatus,
        },
        { status: 500 },
      );
    }

    return Response.json({
      ok: true,
      message: 'Deploy triggered — build usually takes 3–5 minutes.',
      githubStatus: result.githubStatus,
    });
  },
};

import { GlobalConfig } from 'payload';
import { isEditor } from '../access';

/**
 * Tracks the last time a deploy was triggered on the live site,
 * so that content-change hooks can debounce automatic deploys.
 *
 * - `lastAutoDeployAt`  — updated by afterChange/afterDelete hooks AND manual publishes.
 *                        Hooks check this to enforce the 15-minute cooldown.
 * - `lastManualDeployAt` — updated only by the "Publish to Live" button, for UI display.
 * - `lastTriggeredBy`   — "auto" | "manual" | "cron" — shown in admin UI.
 * - `pendingChangesSince` — set when an auto-trigger is skipped due to cooldown,
 *                           cleared when a deploy runs. Tells editors "changes waiting".
 */
export const DeployState: GlobalConfig = {
  slug: 'deploy-state',
  label: 'Deploy State',
  admin: {
    hidden: false,
    description:
      'Internal state for the live-site deploy pipeline. Do not edit directly unless you know what you are doing.',
  },
  access: {
    read: () => true,
    update: isEditor,
  },
  fields: [
    {
      name: 'lastAutoDeployAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Timestamp of the most recent deploy trigger (auto or manual).',
      },
    },
    {
      name: 'lastManualDeployAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Timestamp of the most recent manual "Publish to Live" click.',
      },
    },
    {
      name: 'lastTriggeredBy',
      type: 'select',
      options: [
        { label: 'Automatic (content change)', value: 'auto' },
        { label: 'Manual (Publish button)', value: 'manual' },
        { label: 'Cron (nightly)', value: 'cron' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'pendingChangesSince',
      type: 'date',
      admin: {
        readOnly: true,
        description:
          'Set when an automatic deploy was skipped due to the 15-minute cooldown. Indicates there are unpublished content changes.',
      },
    },
  ],
};

import type { CollectionBeforeValidateHook } from 'payload';

/**
 * Generates a URL-safe slug from the `name` field on create only.
 *
 * Runs in beforeValidate so the slug is populated before Payload's
 * required-field check. Once a slug exists it is never overwritten —
 * renaming a record must not silently change its URL (would break
 * navigation links, external backlinks, and SEO equity).
 */
export const slugFromName: CollectionBeforeValidateHook = ({ data }) => {
  if (data?.name && !data?.slug) {
    data.slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  return data;
};

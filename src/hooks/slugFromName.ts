import type { CollectionBeforeChangeHook } from 'payload';

/**
 * Generates a URL-safe slug from the `name` field before every save.
 *
 * Applied at the collection level so every create / update automatically
 * keeps the slug in sync with the title.
 */
export const slugFromName: CollectionBeforeChangeHook = ({ data }) => {
  if (data?.name) {
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

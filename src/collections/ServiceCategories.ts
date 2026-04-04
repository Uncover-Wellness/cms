import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const ServiceCategories: CollectionConfig = {
  slug: 'service-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'Service Category',
    plural: 'Service Categories',
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'thumbnailImageUrl',
      type: 'text',
    },
    {
      name: 'featuredImageUrl',
      type: 'text',
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'excerptFeaturedShort',
      type: 'textarea',
    },
    {
      name: 'excerptFeaturedLarge',
      type: 'textarea',
    },
    {
      name: 'categoryLink',
      type: 'text',
    },
    {
      name: 'imageLinks',
      type: 'text',
    },
    {
      name: 'experienceText',
      type: 'richText',
    },
  ],
};

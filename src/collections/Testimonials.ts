import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'service'],
  },
  labels: {
    singular: 'Testimonial',
    plural: 'Testimonials',
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
      name: 'testimonialText',
      type: 'textarea',
      required: true,
    },
    {
      name: 'service',
      type: 'text',
      required: true,
    },
    {
      name: 'clientPhotoUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'videoLink',
      type: 'text',
    },
    {
      name: 'videoThumbnailUrl',
      type: 'text',
    },
    {
      name: 'orderIndex',
      type: 'number',
    },
    {
      name: 'relationships',
      type: 'group',
      fields: [
        {
          name: 'serviceCategories',
          type: 'relationship',
          relationTo: 'service-categories',
          hasMany: true,
          required: true,
        },
        {
          name: 'treatments',
          type: 'relationship',
          relationTo: 'treatments',
          hasMany: true,
          required: true,
        },
        {
          name: 'contentCategories',
          type: 'relationship',
          relationTo: 'content-categories',
          hasMany: true,
          required: true,
        },
      ],
    },
  ],
};

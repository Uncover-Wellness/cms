import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';

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
  hooks: { beforeValidate: [slugFromName] },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'testimonialText',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The client\'s testimonial in their own words.',
      },
    },
    {
      name: 'service',
      type: 'text',
      required: true,
      admin: {
        description: 'Service/treatment name shown as a label. Example: "Laser Hair Removal"',
      },
    },
    {
      name: 'clientPhoto',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Client\'s photo. Drag and drop or browse to upload.',
      },
    },
    {
      name: 'clientPhotoUrl',
      type: 'text',
      admin: {
        description: 'Legacy: Old URL. Use the upload field above for new images.',
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'videoLink',
      type: 'text',
      admin: {
        description: 'YouTube or video URL for video testimonials.',
      },
    },
    {
      name: 'videoThumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Video thumbnail image. Drag and drop or browse to upload.',
      },
    },
    {
      name: 'videoThumbnailUrl',
      type: 'text',
      admin: {
        description: 'Legacy: Old URL. Use the upload field above for new images.',
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'orderIndex',
      type: 'number',
      admin: {
        description: 'Display order. Lower = first.',
      },
    },
    {
      name: 'relationships',
      type: 'group',
      label: 'Relationships',
      admin: {
        description: 'Controls which pages this testimonial appears on.',
      },
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

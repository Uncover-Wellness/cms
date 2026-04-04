import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const VideoTestimonials: CollectionConfig = {
  slug: 'video-testimonials',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'Video Testimonial',
    plural: 'Video Testimonials',
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
      name: 'testimonialVideoLink',
      type: 'text',
      required: true,
    },
    {
      name: 'videoThumbnailUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'shortTextDescription',
      type: 'textarea',
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
          name: 'contentCategories',
          type: 'relationship',
          relationTo: 'content-categories',
          hasMany: true,
        },
      ],
    },
  ],
};

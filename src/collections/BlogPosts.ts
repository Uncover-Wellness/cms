import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'featured', 'publishedAt'],
  },
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
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
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'pageTitle',
          type: 'text',
          maxLength: 60,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
        },
      ],
    },
    {
      name: 'featuredImageUrl',
      type: 'text',
    },
    {
      name: 'featuredImageAltText',
      type: 'text',
    },
    {
      name: 'thumbnailImageV1Url',
      type: 'text',
    },
    {
      name: 'thumbnailImageV2Url',
      type: 'text',
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'postBody',
      type: 'richText',
    },
    {
      name: 'richText2',
      type: 'richText',
    },
    {
      name: 'codeEmbedCode',
      type: 'code',
      admin: {
        language: 'html',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
    },
    {
      name: 'relationships',
      type: 'group',
      fields: [
        {
          name: 'blogPostCategory',
          type: 'relationship',
          relationTo: 'blog-post-categories',
        },
        {
          name: 'doctor',
          type: 'relationship',
          relationTo: 'doctors',
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
  ],
};

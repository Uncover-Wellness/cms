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
      admin: {
        description: 'Blog post title displayed as the H1 heading.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated from name. Used in the URL: /post/{slug}',
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'pageTitle',
          type: 'text',
          maxLength: 60,
          admin: {
            description: 'Browser tab title. Keep under 60 characters.',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
          admin: {
            description: 'Google results summary. Keep under 160 characters.',
          },
        },
      ],
    },
    {
      name: 'featuredImageUrl',
      type: 'text',
      admin: {
        description: 'Cloudinary URL for the main blog post hero image.',
      },
    },
    {
      name: 'featuredImageAltText',
      type: 'text',
      admin: {
        description: 'Alt text for the featured image.',
      },
    },
    {
      name: 'thumbnailImageV1Url',
      type: 'text',
      admin: {
        description: 'Cloudinary URL for the small thumbnail used in blog listing cards.',
      },
    },
    {
      name: 'thumbnailImageV2Url',
      type: 'text',
      admin: {
        description: 'Cloudinary URL for the alternate/larger thumbnail.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary shown on blog listing cards and used as SEO fallback.',
      },
    },
    {
      name: 'postBody',
      type: 'richText',
      admin: {
        description: 'Main blog post content. Use headings, lists, and links for best readability.',
      },
    },
    {
      name: 'richText2',
      type: 'richText',
      admin: {
        description: 'Additional rich text content appended after the main body.',
      },
    },
    {
      name: 'codeEmbedCode',
      type: 'code',
      admin: {
        language: 'html',
        description: 'Raw HTML embed (e.g. YouTube video, comparison table). Rendered as-is on the page.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      admin: {
        description: 'Featured posts appear in the highlighted section on the blog listing page.',
      },
    },
    {
      name: 'relationships',
      type: 'group',
      label: 'Relationships',
      fields: [
        {
          name: 'blogPostCategory',
          type: 'relationship',
          relationTo: 'blog-post-categories',
          admin: {
            description: 'Category for this post (e.g. Skin Care, Hair Care, Wellness).',
          },
        },
        {
          name: 'doctor',
          type: 'relationship',
          relationTo: 'doctors',
          admin: {
            description: 'Author doctor. Shown as byline on the blog post.',
          },
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'Publication date shown on the blog post. Used for sorting.',
      },
    },
  ],
};

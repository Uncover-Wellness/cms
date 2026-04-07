import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const Costs: CollectionConfig = {
  slug: 'costs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'Cost',
    plural: 'Costs',
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
        description: 'Auto-generated from name. Used in the URL: /cost/{slug}',
      },
    },
    {
      name: 'pageTitle',
      type: 'richText',
      admin: {
        description: 'Rich-text page title displayed at the top of the cost page.',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      label: 'Pricing Range',
      admin: {
        description: 'Price range displayed in the pricing overview card.',
      },
      fields: [
        {
          name: 'lowestCost',
          type: 'text',
          admin: { description: 'Example: "₹2,500"' },
        },
        {
          name: 'averageCost',
          type: 'text',
          admin: { description: 'Example: "₹5,000"' },
        },
        {
          name: 'highestCost',
          type: 'text',
          admin: { description: 'Example: "₹15,000"' },
        },
      ],
    },
    {
      name: 'costInflationGraphPoints',
      type: 'text',
      admin: {
        description: 'Comma-separated data points for the cost inflation graph.',
      },
    },
    {
      name: 'treatmentPointers',
      type: 'richText',
      admin: {
        description: 'First set of treatment pointers / key takeaways.',
      },
    },
    {
      name: 'treatmentPointers2',
      type: 'richText',
      admin: {
        description: 'Second set of treatment pointers.',
      },
    },
    {
      name: 'treatmentContent1',
      type: 'richText',
      admin: {
        description: 'First body content section.',
      },
    },
    {
      name: 'treatmentContent2',
      type: 'richText',
      admin: {
        description: 'Second body content section.',
      },
    },
    {
      name: 'customTableCode',
      type: 'code',
      admin: {
        language: 'html',
        description: 'Raw HTML for a custom pricing table. Rendered as-is on the page.',
      },
    },
    {
      name: 'treatmentDetails',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      labels: { singular: 'Treatment Detail', plural: 'Treatment Details' },
      admin: {
        description: 'Expandable detail sections shown below the pricing overview.',
        initCollapsed: true,
        components: {
          RowLabel: {
            path: '/src/components/admin/RowLabel/index.tsx#default',
            clientProps: { fieldName: 'heading' },
          },
        },
      },
      fields: [
        {
          name: 'heading',
          type: 'richText',
        },
        {
          name: 'content',
          type: 'richText',
        },
      ],
    },
    {
      name: 'relationships',
      type: 'group',
      label: 'Relationships',
      fields: [
        {
          name: 'contentCategory',
          type: 'relationship',
          relationTo: 'content-categories',
          required: true,
          admin: {
            description: 'Content category for FAQ grouping.',
          },
        },
        {
          name: 'treatmentsSection1',
          type: 'relationship',
          relationTo: 'treatments',
          hasMany: true,
          admin: {
            description: 'Treatments shown in the first pricing section.',
          },
        },
        {
          name: 'treatmentsSection2',
          type: 'relationship',
          relationTo: 'treatments',
          hasMany: true,
          admin: {
            description: 'Treatments shown in the second pricing section.',
          },
        },
      ],
    },
  ],
};

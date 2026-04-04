import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const Doctors: CollectionConfig = {
  slug: 'doctors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'jobTitle'],
  },
  labels: {
    singular: 'Doctor',
    plural: 'Doctors',
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
      name: 'portraitImageUrl',
      type: 'text',
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'jobTitle',
      type: 'text',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'medicalRegistration',
      type: 'text',
    },
    {
      name: 'highlightText',
      type: 'text',
    },
    {
      name: 'detailedQualifications',
      type: 'richText',
    },
    {
      name: 'myExperience',
      type: 'richText',
    },
    {
      name: 'membershipsAffiliations',
      type: 'richText',
    },
    {
      name: 'awardRecognitions',
      type: 'richText',
    },
    {
      name: 'metrics',
      type: 'group',
      fields: [
        {
          name: 'reviewsMetric',
          type: 'text',
        },
        {
          name: 'yearsExperienceMetric',
          type: 'text',
        },
        {
          name: 'patientsServedMetric',
          type: 'text',
        },
        {
          name: 'awardsMetric',
          type: 'text',
        },
      ],
    },
    {
      name: 'zenotiReferenceId',
      type: 'text',
      unique: true,
    },
    {
      name: 'facebookLink',
      type: 'text',
    },
    {
      name: 'orderIndex',
      type: 'number',
    },
  ],
};

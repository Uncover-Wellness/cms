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
        description: 'Auto-generated from name. Used in the URL: /doctor/{slug}',
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
          maxLength: 80,
          admin: {
            description: 'Browser tab title. Keep under 65 characters for best Google display.',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 200,
          admin: {
            description: 'Short summary shown in Google results. Keep under 160 characters.',
          },
        },
      ],
    },
    {
      name: 'portraitImageUrl',
      type: 'text',
      admin: {
        description: 'Cloudinary URL for the doctor\'s portrait photo.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'One-line summary shown on doctor listing cards.',
      },
    },
    {
      name: 'jobTitle',
      type: 'text',
      admin: {
        description: 'Professional title. Example: "Dermatologist & Cosmetologist"',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Short bio paragraph shown on the doctor detail page.',
      },
    },
    {
      name: 'medicalRegistration',
      type: 'text',
      admin: {
        description: 'Medical council registration number.',
      },
    },
    {
      name: 'highlightText',
      type: 'text',
      admin: {
        description: 'Short highlight shown as a badge. Example: "10+ Years Experience"',
      },
    },
    {
      name: 'detailedQualifications',
      type: 'richText',
      admin: {
        description: 'Full list of qualifications and degrees.',
      },
    },
    {
      name: 'myExperience',
      type: 'richText',
      admin: {
        description: 'Work experience and career history.',
      },
    },
    {
      name: 'membershipsAffiliations',
      type: 'richText',
      admin: {
        description: 'Professional memberships and affiliations.',
      },
    },
    {
      name: 'awardRecognitions',
      type: 'richText',
      admin: {
        description: 'Awards and recognitions received.',
      },
    },
    {
      name: 'metrics',
      type: 'group',
      label: 'Metrics',
      admin: {
        description: 'Statistics displayed as badges on the doctor card.',
      },
      fields: [
        {
          name: 'reviewsMetric',
          type: 'text',
          admin: { description: 'Example: "500+ Reviews"' },
        },
        {
          name: 'yearsExperienceMetric',
          type: 'text',
          admin: { description: 'Example: "10+ Years"' },
        },
        {
          name: 'patientsServedMetric',
          type: 'text',
          admin: { description: 'Example: "10,000+ Patients"' },
        },
        {
          name: 'awardsMetric',
          type: 'text',
          admin: { description: 'Example: "5 Awards"' },
        },
      ],
    },
    {
      name: 'zenotiReferenceId',
      type: 'text',
      unique: true,
      admin: {
        description: 'Zenoti system ID for this doctor. Used for booking integration.',
      },
    },
    {
      name: 'facebookLink',
      type: 'text',
      admin: {
        description: 'Full Facebook profile URL.',
      },
    },
    {
      name: 'orderIndex',
      type: 'number',
      admin: {
        description: 'Display order on the doctors listing page. Lower numbers appear first.',
      },
    },
  ],
};

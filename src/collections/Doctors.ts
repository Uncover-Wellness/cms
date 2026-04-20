import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';

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
  hooks: { beforeValidate: [slugFromName] },
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
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated from name. Used in the URL: /doctor/{slug}',
      },
    },
    {
      name: 'portraitImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Doctor\'s portrait photo. Drag and drop or browse to upload.',
      },
    },
    {
      name: 'portraitImageUrl',
      type: 'text',
      admin: {
        description: 'Legacy: Old Cloudinary URL. Use the upload field above for new images.',
        readOnly: true,
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
      name: 'education',
      type: 'array',
      admin: {
        description: 'Structured education entries — populates Physician.alumniOf + hasCredential in JSON-LD (schema.org) for medical E-E-A-T. Use this instead of detailedQualifications when you want machine-readable credentials.',
        initCollapsed: true,
      },
      fields: [
        { name: 'degree', type: 'text', required: true, admin: { description: 'e.g. MBBS, MD Dermatology, FRCS' } },
        { name: 'institution', type: 'text', required: true },
        { name: 'year', type: 'text' },
        { name: 'location', type: 'text' },
      ],
    },
    {
      name: 'specializations',
      type: 'array',
      admin: {
        description: 'Areas of expertise rendered as icon cards on the doctor page. Also populates Physician.knowsAbout for schema.org.',
        initCollapsed: true,
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'stethoscope',
          options: [
            { label: 'Shield', value: 'shield' },
            { label: 'Stethoscope', value: 'stethoscope' },
            { label: 'Sun', value: 'sun' },
            { label: 'Heart', value: 'heart' },
            { label: 'Zap', value: 'zap' },
            { label: 'Sparkles', value: 'sparkles' },
            { label: 'Award', value: 'award' },
            { label: 'Leaf', value: 'leaf' },
          ],
        },
      ],
    },
    {
      name: 'beforeAfter',
      type: 'array',
      admin: {
        description: 'Optional before/after gallery for this doctor. Renders as a gallery section on their profile page.',
        initCollapsed: true,
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'beforeImageUrl', type: 'text', required: true },
        { name: 'afterImageUrl', type: 'text', required: true },
        { name: 'caption', type: 'textarea' },
      ],
    },
    {
      name: 'sameAs',
      type: 'array',
      admin: {
        description: 'Social/professional profile links — populates Physician.sameAs in JSON-LD for Google Knowledge Graph signals.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Instagram', value: 'instagram' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'Practo', value: 'practo' },
            { label: 'Other', value: 'other' },
          ],
        },
        { name: 'url', type: 'text', required: true },
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

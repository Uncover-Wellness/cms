import { Block, Field } from 'payload';

// Icon options shared by benefits, contentGrid, specializations.
// Match the SVG inventory at uncover-astro/public/images/icons/.
const ICON_OPTIONS = [
  { label: 'Shield', value: 'shield' },
  { label: 'Stethoscope', value: 'stethoscope' },
  { label: 'Sun', value: 'sun' },
  { label: 'Heart', value: 'heart' },
  { label: 'Zap', value: 'zap' },
  { label: 'Sparkles', value: 'sparkles' },
  { label: 'Technology', value: 'tech' },
  { label: 'Doctors', value: 'doctors' },
  { label: 'Results', value: 'results' },
  { label: 'Experience', value: 'experience' },
  { label: 'Award', value: 'award' },
  { label: 'Checkmark', value: 'check' },
  { label: 'Clock', value: 'clock' },
  { label: 'Leaf', value: 'leaf' },
];

const CTA_FIELDS: Field[] = [
  { name: 'label', type: 'text' },
  { name: 'href', type: 'text' },
];

export const TextSection: Block = {
  slug: 'textSection',
  labels: { singular: 'Text Section', plural: 'Text Sections' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: { description: 'Section heading (H2).' },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'image',
      type: 'text',
      admin: { description: 'Cloudinary URL for an optional section image.' },
    },
    {
      name: 'imageAltText',
      type: 'text',
      admin: { description: 'Alt text for the image.' },
    },
  ],
};

export const VideoEmbed: Block = {
  slug: 'videoEmbed',
  labels: { singular: 'Video Embed', plural: 'Video Embeds' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: { description: 'Optional heading above the video.' },
    },
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
      admin: { description: 'YouTube or Vimeo URL.' },
    },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Optional caption below the video.' },
    },
  ],
};

export const HtmlEmbed: Block = {
  slug: 'htmlEmbed',
  labels: { singular: 'HTML Embed', plural: 'HTML Embeds' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: { description: 'Optional heading above the embed.' },
    },
    {
      name: 'code',
      type: 'code',
      required: true,
      admin: {
        language: 'html',
        description: 'Raw HTML rendered as-is on the page.',
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Extended block library — ported from uncover-gags section composition.
// Editors can combine these freely with TextSection/VideoEmbed/HtmlEmbed
// inside the pageBlocks field on Treatments, Concerns, and ServiceCategories.
// ---------------------------------------------------------------------------

export const OverviewBlock: Block = {
  slug: 'overviewBlock',
  labels: { singular: 'Overview Prose', plural: 'Overview Proses' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    {
      name: 'paragraphs',
      type: 'array',
      minRows: 1,
      fields: [{ name: 'text', type: 'textarea', required: true }],
      admin: { description: 'One paragraph per row.' },
    },
  ],
};

export const BenefitsBlock: Block = {
  slug: 'benefitsBlock',
  labels: { singular: 'Benefits Grid', plural: 'Benefits Grids' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'icon', type: 'select', options: ICON_OPTIONS, defaultValue: 'shield' },
      ],
    },
  ],
};

export const ProcessBlock: Block = {
  slug: 'processBlock',
  labels: { singular: 'Process Steps', plural: 'Process Steps' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    {
      name: 'steps',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
  ],
};

export const BeforeAfterBlock: Block = {
  slug: 'beforeAfterBlock',
  labels: { singular: 'Before/After Gallery', plural: 'Before/After Galleries' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'beforeImageUrl', type: 'text', required: true },
        { name: 'afterImageUrl', type: 'text', required: true },
        { name: 'caption', type: 'textarea' },
      ],
    },
  ],
};

export const DataTableBlock: Block = {
  slug: 'dataTable',
  labels: { singular: 'Data Table', plural: 'Data Tables' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'caption', type: 'textarea' },
    {
      name: 'columns',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'key', type: 'text', required: true, admin: { description: 'Matches a cell key in each row' } },
        { name: 'label', type: 'text', required: true },
        {
          name: 'align',
          type: 'select',
          enumName: 'align',
          defaultValue: 'left',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
        { name: 'highlight', type: 'checkbox' },
      ],
    },
    {
      name: 'rows',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'cells',
          type: 'array',
          fields: [
            { name: 'key', type: 'text', required: true, admin: { description: 'Matches a column key' } },
            { name: 'value', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
};

export const PricingBlock: Block = {
  slug: 'pricingBlock',
  labels: { singular: 'Pricing Cards', plural: 'Pricing Cards' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    {
      name: 'plans',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'price', type: 'text', required: true, admin: { description: 'Numeric amount, no currency symbol' } },
        { name: 'currency', type: 'text', defaultValue: '₹' },
        { name: 'description', type: 'textarea' },
        {
          name: 'features',
          type: 'array',
          fields: [{ name: 'value', type: 'text', required: true }],
        },
        { name: 'highlighted', type: 'checkbox' },
        { name: 'badge', type: 'text' },
        { name: 'ctaLabel', type: 'text', defaultValue: 'Book Now' },
        { name: 'ctaHref', type: 'text', defaultValue: '#booking' },
      ],
    },
  ],
};

export const CtaBlock: Block = {
  slug: 'ctaBlock',
  labels: { singular: 'CTA Band', plural: 'CTA Bands' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'primaryCta', type: 'group', fields: CTA_FIELDS },
    { name: 'secondaryCta', type: 'group', fields: CTA_FIELDS },
    {
      name: 'variant',
      type: 'select',
      enumName: 'ctaVariant',
      defaultValue: 'dark',
      options: [
        { label: 'Dark (brown-dark bg)', value: 'dark' },
        { label: 'Cream bg', value: 'cream' },
        { label: 'Beige bg', value: 'beige' },
      ],
    },
  ],
};

export const ContentGridBlock: Block = {
  slug: 'contentGrid',
  labels: { singular: 'Content Grid', plural: 'Content Grids' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    {
      name: 'columns',
      type: 'select',
      enumName: 'gridCols',
      defaultValue: '2',
      options: [
        { label: '2 columns', value: '2' },
        { label: '3 columns', value: '3' },
        { label: '4 columns', value: '4' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'imageUrl', type: 'text' },
        { name: 'imageAltText', type: 'text' },
        { name: 'href', type: 'text' },
        { name: 'icon', type: 'select', options: ICON_OPTIONS },
      ],
    },
  ],
};

export const ImageSliderBlock: Block = {
  slug: 'imageSlider',
  labels: { singular: 'Image Slider', plural: 'Image Sliders' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    {
      name: 'aspectRatio',
      type: 'select',
      enumName: 'aspectRatio',
      defaultValue: '16/9',
      options: [
        { label: '16:9', value: '16/9' },
        { label: '4:3', value: '4/3' },
        { label: '1:1 Square', value: '1/1' },
        { label: '3:4 Portrait', value: '3/4' },
      ],
    },
    { name: 'autoplayMs', type: 'number', defaultValue: 0, admin: { description: '0 = no autoplay; else ms between slides' } },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'imageUrl', type: 'text', required: true },
        { name: 'imageAltText', type: 'text' },
        { name: 'caption', type: 'text' },
      ],
    },
  ],
};

export const StatsBlock: Block = {
  slug: 'statsBlock',
  labels: { singular: 'Stats Strip', plural: 'Stats Strips' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'value', type: 'text', required: true, admin: { description: 'e.g. "10,000"' } },
        { name: 'label', type: 'text', required: true },
        { name: 'suffix', type: 'text', admin: { description: 'Optional suffix like "+" or "%"' } },
      ],
    },
    {
      name: 'variant',
      type: 'select',
      enumName: 'statsVariant',
      defaultValue: 'dark',
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Cream', value: 'cream' },
      ],
    },
  ],
};

export const DoctorsEmbedBlock: Block = {
  slug: 'doctorsEmbed',
  labels: { singular: 'Doctors Carousel', plural: 'Doctors Carousels' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'limit', type: 'number', defaultValue: 6 },
    { name: 'filterByContentCategory', type: 'relationship', relationTo: 'content-categories' },
  ],
};

export const TestimonialsEmbedBlock: Block = {
  slug: 'testimonialsEmbed',
  labels: { singular: 'Testimonials Carousel', plural: 'Testimonials Carousels' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'limit', type: 'number', defaultValue: 6 },
    { name: 'filterByTreatment', type: 'relationship', relationTo: 'treatments' },
    { name: 'filterByContentCategory', type: 'relationship', relationTo: 'content-categories' },
  ],
};

export const FaqsEmbedBlock: Block = {
  slug: 'faqsEmbed',
  labels: { singular: 'FAQ Accordion', plural: 'FAQ Accordions' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'filterByContentCategory', type: 'relationship', relationTo: 'content-categories' },
    {
      name: 'inlineFaqs',
      type: 'array',
      admin: { description: 'Optional inline FAQs — used instead of a category lookup when populated.' },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
};

export const BookingFormBlock: Block = {
  slug: 'bookingForm',
  labels: { singular: 'Booking Form', plural: 'Booking Forms' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true, defaultValue: 'Book Your Consultation' },
    { name: 'ctaLabel', type: 'text', defaultValue: 'Book FREE Consultation' },
  ],
};

// Shared list of all page blocks (legacy + new). Import into any collection
// that needs a pageBlocks field.
export const ALL_PAGE_BLOCKS: Block[] = [
  TextSection,
  VideoEmbed,
  HtmlEmbed,
  OverviewBlock,
  BenefitsBlock,
  ProcessBlock,
  BeforeAfterBlock,
  DataTableBlock,
  PricingBlock,
  CtaBlock,
  ContentGridBlock,
  ImageSliderBlock,
  StatsBlock,
  DoctorsEmbedBlock,
  TestimonialsEmbedBlock,
  FaqsEmbedBlock,
  BookingFormBlock,
];

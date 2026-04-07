import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor, EXPERIMENTAL_TableFeature } from '@payloadcms/richtext-lexical';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage';
import { seoPlugin } from '@payloadcms/plugin-seo';
import type { GenerateTitle, GenerateDescription } from '@payloadcms/plugin-seo/types';
import path from 'path';
import { fileURLToPath } from 'url';

import { ContentCategories } from './src/collections/ContentCategories';
import { ServiceCategories } from './src/collections/ServiceCategories';
import { Concerns } from './src/collections/Concerns';
import { Treatments } from './src/collections/Treatments';
import { Doctors } from './src/collections/Doctors';
import { Locations } from './src/collections/Locations';
import { BlogPostCategories } from './src/collections/BlogPostCategories';
import { BlogPosts } from './src/collections/BlogPosts';
import { Faqs } from './src/collections/Faqs';
import { Testimonials } from './src/collections/Testimonials';
import { VideoTestimonials } from './src/collections/VideoTestimonials';
import { TreatmentCosts } from './src/collections/TreatmentCosts';
import { Costs } from './src/collections/Costs';
import { LandingPages } from './src/collections/LandingPages';
import { Lps } from './src/collections/Lps';
import { Lp2s } from './src/collections/Lp2s';
import { JobOpenings } from './src/collections/JobOpenings';
import { SurveyQuestions } from './src/collections/SurveyQuestions';
import { Media } from './src/collections/Media';
import { cloudinaryAdapter } from './src/adapters/cloudinaryAdapter';

import { DeployState } from './src/globals/DeployState';
import { withDeployHooks } from './src/hooks/deployHooks';
import { publishNow } from './src/endpoints/publishNow';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  ...(process.env.SMTP_HOST
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.SMTP_FROM_ADDRESS || 'noreply@uncover.co.in',
          defaultFromName: process.env.SMTP_FROM_NAME || 'Uncover Clinics',
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          },
        }),
      }
    : {}),
  secret: process.env.PAYLOAD_SECRET || 'uncover-cms-change-this-in-production',
  cors: [
    process.env.PREVIEW_URL || 'https://ai.uncover.co.in',
    'http://localhost:4322',
  ],
  csrf: [
    process.env.PREVIEW_URL || 'https://ai.uncover.co.in',
    'http://localhost:4322',
  ],
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '| Uncover CMS',
    },
    components: {
      beforeNavLinks: ['/src/components/admin/PublishButton/index.tsx#default'],
    },
    livePreview: {
      url: ({ data, collectionConfig }) => {
        const previewBase = process.env.PREVIEW_URL || 'https://ai.uncover.co.in';
        const slug = data?.slug || '';
        const routeMap: Record<string, string> = {
          treatments: `/preview/treatment/${slug}`,
          'blog-posts': `/preview/post/${slug}`,
          doctors: `/preview/doctor/${slug}`,
          concerns: `/preview/concern/${slug}`,
          costs: `/preview/cost/${slug}`,
          'landing-pages': `/preview/landing/${slug}`,
          lps: `/preview/lp/${slug}`,
          lp2s: `/preview/lp2/${slug}`,
          'service-categories': `/preview/c/${slug}`,
          'job-openings': `/preview/careers/${slug}`,
          'blog-post-categories': `/preview/categories/${slug}`,
        };
        const path = collectionConfig?.slug ? routeMap[collectionConfig.slug] : null;
        return path ? `${previewBase}${path}` : previewBase;
      },
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
      collections: [
        'treatments',
        'blog-posts',
        'doctors',
        'concerns',
        'costs',
        'landing-pages',
        'lps',
        'lp2s',
        'service-categories',
        'job-openings',
        'blog-post-categories',
      ],
    },
  },
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, EXPERIMENTAL_TableFeature()],
  }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    schemaName: 'cms',
    push: true,
  }),
  collections: [
    {
      slug: 'users',
      auth: {
        verify: true,
        forgotPassword: {},
      },
      admin: { useAsTitle: 'email' },
      fields: [],
    },
    // Content collections that affect the public Astro site get auto-deploy hooks.
    withDeployHooks(ContentCategories),
    withDeployHooks(ServiceCategories),
    withDeployHooks(Concerns),
    withDeployHooks(Treatments),
    withDeployHooks(Doctors),
    withDeployHooks(Locations),
    withDeployHooks(BlogPostCategories),
    withDeployHooks(BlogPosts),
    withDeployHooks(Faqs),
    withDeployHooks(Testimonials),
    withDeployHooks(VideoTestimonials),
    withDeployHooks(TreatmentCosts),
    withDeployHooks(Costs),
    withDeployHooks(LandingPages),
    withDeployHooks(Lps),
    withDeployHooks(Lp2s),
    withDeployHooks(JobOpenings),
    // Internal — no public-facing pages, no deploy hook needed
    SurveyQuestions,
    // Media uploads — stored on Cloudinary, no deploy hook needed
    Media,
  ],
  globals: [DeployState],
  endpoints: [publishNow],
  plugins: [
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: cloudinaryAdapter({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
            api_key: process.env.CLOUDINARY_API_KEY || '',
            api_secret: process.env.CLOUDINARY_API_SECRET || '',
            folder: 'uncover-cms',
          }),
          disableLocalStorage: true,
        },
      },
    }),
    seoPlugin({
      collections: [
        'treatments',
        'concerns',
        'doctors',
        'blog-posts',
        'costs',
        'locations',
        'landing-pages',
        'lps',
        'job-openings',
        'service-categories',
        'blog-post-categories',
      ],
      uploadsCollection: 'media',
      generateTitle: (({ doc }) => doc?.name || '') as GenerateTitle,
      generateDescription: (({ doc }) => (doc as any)?.excerpt || '') as GenerateDescription,
    }),
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});

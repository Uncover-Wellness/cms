import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
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
import { ProductCategories } from './src/collections/ProductCategories';
import { Products } from './src/collections/Products';
import { Skus } from './src/collections/Skus';

import { DeployState } from './src/globals/DeployState';
import { withDeployHooks } from './src/hooks/deployHooks';
import { publishNow } from './src/endpoints/publishNow';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  secret: process.env.PAYLOAD_SECRET || 'uncover-cms-change-this-in-production',
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '| Uncover CMS',
    },
    components: {
      beforeNavLinks: ['/src/components/admin/PublishButton/index.tsx#default'],
    },
  },
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    schemaName: 'cms',
    // push=true auto-adds missing tables/columns on boot (non-destructive).
    // Needed so the deploy_state global table is created automatically
    // without requiring a manual migration step.
    push: true,
  }),
  collections: [
    {
      slug: 'users',
      auth: true,
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
    ProductCategories,
    Products,
    Skus,
  ],
  globals: [DeployState],
  endpoints: [publishNow],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});

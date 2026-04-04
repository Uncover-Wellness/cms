import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';

import { ContentCategories } from './collections/ContentCategories';
import { ServiceCategories } from './collections/ServiceCategories';
import { Concerns } from './collections/Concerns';
import { Treatments } from './collections/Treatments';
import { Doctors } from './collections/Doctors';
import { Locations } from './collections/Locations';
import { BlogPostCategories } from './collections/BlogPostCategories';
import { BlogPosts } from './collections/BlogPosts';
import { Faqs } from './collections/Faqs';
import { Testimonials } from './collections/Testimonials';
import { VideoTestimonials } from './collections/VideoTestimonials';
import { TreatmentCosts } from './collections/TreatmentCosts';
import { Costs } from './collections/Costs';
import { LandingPages } from './collections/LandingPages';
import { Lps } from './collections/Lps';
import { Lp2s } from './collections/Lp2s';
import { JobOpenings } from './collections/JobOpenings';
import { SurveyQuestions } from './collections/SurveyQuestions';
import { ProductCategories } from './collections/ProductCategories';
import { Products } from './collections/Products';
import { Skus } from './collections/Skus';

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
  },
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    schemaName: 'cms',
  }),
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: { useAsTitle: 'email' },
      fields: [],
    },
    ContentCategories,
    ServiceCategories,
    Concerns,
    Treatments,
    Doctors,
    Locations,
    BlogPostCategories,
    BlogPosts,
    Faqs,
    Testimonials,
    VideoTestimonials,
    TreatmentCosts,
    Costs,
    LandingPages,
    Lps,
    Lp2s,
    JobOpenings,
    SurveyQuestions,
    ProductCategories,
    Products,
    Skus,
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});

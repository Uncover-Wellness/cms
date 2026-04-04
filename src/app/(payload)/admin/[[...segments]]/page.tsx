// @ts-nocheck
import { DefaultTemplate } from '@payloadcms/next/templates';
import { importMap } from '../importMap';
import configPromise from '../../../../payload.config';

export { generatePageMetadata as generateMetadata } from '@payloadcms/next/views';

const Page = (props) => {
  return <DefaultTemplate config={configPromise} importMap={importMap} {...props} />;
};

export default Page;

import type { Metadata } from 'next';
import { RootLayout } from '@payloadcms/next/layouts';
import React from 'react';
import configPromise from '../../payload.config';

export const metadata: Metadata = {
  title: 'Uncover CMS',
};

type Args = {
  children: React.ReactNode;
};

const Layout = ({ children }: Args) => {
  return <RootLayout config={configPromise}>{children}</RootLayout>;
};

export default Layout;

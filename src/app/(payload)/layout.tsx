// @ts-nocheck
import { RootLayout } from '@payloadcms/next/layouts';
import React from 'react';
import configPromise from '../../payload.config';
import { importMap } from './admin/importMap';
import { serverFunction } from './serverFunction';

export const metadata = {
  title: 'Uncover CMS',
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <RootLayout config={configPromise} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
};

export default Layout;

import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

interface R2AdapterOptions {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBase: string;
  folder?: string;
}

export const r2Adapter = (opts: R2AdapterOptions): Adapter => {
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${opts.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: opts.accessKeyId,
      secretAccessKey: opts.secretAccessKey,
    },
  });

  const publicBase = opts.publicBase.replace(/\/+$/, '');

  return ({ collection, prefix }) => {
    const folder = opts.folder ?? prefix ?? collection.slug;

    const adapter: GeneratedAdapter = {
      name: 'r2',

      handleUpload: async ({ file }) => {
        const isSvg = file.mimeType === 'image/svg+xml';
        let buffer: Buffer;
        let mimeType: string;
        let filename: string;

        if (isSvg) {
          buffer = file.buffer;
          mimeType = file.mimeType;
          filename = file.filename;
        } else {
          buffer = await sharp(file.buffer).webp({ quality: 82 }).toBuffer();
          mimeType = 'image/webp';
          filename = file.filename.replace(/\.[^.]+$/, '.webp');
        }

        const key = `${folder}/${filename}`;

        await client.send(
          new PutObjectCommand({
            Bucket: opts.bucket,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
            CacheControl: 'public, max-age=31536000, immutable',
          }),
        );

        let width: number | undefined;
        let height: number | undefined;
        if (!isSvg) {
          const meta = await sharp(buffer).metadata();
          width = meta.width;
          height = meta.height;
        }

        return {
          filename,
          filesize: buffer.length,
          mimeType,
          width,
          height,
        };
      },

      handleDelete: async ({ filename }) => {
        try {
          await client.send(
            new DeleteObjectCommand({
              Bucket: opts.bucket,
              Key: `${folder}/${filename}`,
            }),
          );
        } catch {
          // ignore
        }
      },

      generateURL: ({ filename }) => `${publicBase}/${folder}/${filename}`,

      staticHandler: (_req, { params }) => {
        const { filename } = params;
        return Response.redirect(`${publicBase}/${folder}/${filename}`, 302);
      },
    };

    return adapter;
  };
};

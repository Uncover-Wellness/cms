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

      handleUpload: async ({ file, data }) => {
        // Payload's cloud-storage plugin calls handleUpload once per file —
        // the main upload plus one call per imageSize variant. For variants,
        // Payload has already computed the filename/mimeType/dimensions and
        // written them into data.sizes.{name}; re-encoding here and returning
        // metadata would (a) make sizes_{name}_filename point at a file that
        // doesn't exist (if the extension is rewritten to .webp but data.sizes
        // keeps .jpg/.png), and (b) clobber the main doc via the plugin's
        // last-write-wins spread-reduce of every handleUpload return value
        // (see @payloadcms/plugin-cloud-storage afterChange.js). So for
        // variants we upload Payload's pre-resized buffer verbatim and return
        // nothing; only the main-file call contributes to the doc's
        // filename / filesize / mimeType / width / height.
        const isVariant =
          !!data?.sizes &&
          Object.values(data.sizes as Record<string, { filename?: string } | undefined>).some(
            (s) => s?.filename === file.filename,
          );

        const put = (key: string, body: Buffer, contentType: string) =>
          client.send(
            new PutObjectCommand({
              Bucket: opts.bucket,
              Key: key,
              Body: body,
              ContentType: contentType,
              CacheControl: 'public, max-age=31536000, immutable',
            }),
          );

        if (isVariant) {
          await put(`${folder}/${file.filename}`, file.buffer, file.mimeType);
          // Empty object: the plugin reduces handleUpload returns with a
          // spread, so an empty object is a no-op and keeps the main doc's
          // fields intact.
          return {};
        }

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

        await put(`${folder}/${filename}`, buffer, mimeType);

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

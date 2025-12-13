import archiver from 'archiver';
import { PassThrough } from 'node:stream';
import { ZIP_MIME_TYPE } from '@auto-document/types/file';

export async function zipFiles(files: File[]): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => {
      const zipBuffer = Buffer.concat(chunks);
      const fileBlob = new Blob([zipBuffer], { type: ZIP_MIME_TYPE });
      resolve(fileBlob);
    });

    stream.on('error', reject);
    archive.on('error', reject);

    archive.pipe(stream);

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      archive.append(buffer, { name: file.name! });
    }

    archive.finalize();
  });
}

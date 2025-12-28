import archiver from 'archiver';
import { PassThrough } from 'node:stream';
import path from 'path';
export function zipFiles(files: Bun.BunFile[]): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(new Blob([Buffer.concat(chunks)], { type: 'application/zip' })));
    archive.on('error', reject);

    archive.pipe(stream);

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = path.basename(file.name!);
      archive.append(buffer, { name: filename });
    }

    archive.finalize();
  });
}

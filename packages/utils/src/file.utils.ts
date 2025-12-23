import archiver from 'archiver';
import { PassThrough } from 'node:stream';
import { ZIP_MIME_TYPE } from '@auto-document/types/file';
import { Observable } from 'rxjs';

export function zipFiles(files$: Observable<File>): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];
    const pending: Promise<void>[] = [];
    let isComplete = false;

    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => {
      const zipBuffer = Buffer.concat(chunks);
      resolve(new Blob([zipBuffer], { type: ZIP_MIME_TYPE }));
    });
    stream.on('error', reject);
    archive.on('error', reject);
    archive.pipe(stream);

    const tryFinalize = async () => {
      if (isComplete && pending.length === 0) {
        archive.finalize();
      }
    };

    files$.subscribe({
      next: file => {
        const task = (async () => {
          const buffer = Buffer.from(await file.arrayBuffer());
          archive.append(buffer, { name: file.name });
        })();
        pending.push(task);
        task.finally(() => {
          pending.splice(pending.indexOf(task), 1);
          tryFinalize();
        });
      },
      error: reject,
      complete: () => {
        isComplete = true;
        tryFinalize();
      },
    });
  });
}

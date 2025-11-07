import archiver from 'archiver';

export const base64ToFile = (dataUrl: string, filename: string = 'screenshot.png'): File => {
  const base64 = dataUrl.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');
  const blob = new Blob([buffer], { type: 'image/png' });
  const file = new File([blob], filename, { type: 'image/png' });
  return file;
};

export const zipFiles = async (files: File[]): Promise<File> => {
  return new Promise(async (resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    archive.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const blob = new Blob([buffer], { type: 'application/zip' });
      const zipFile = new File([blob], 'documents.zip', { type: 'application/zip' });
      resolve(zipFile);
    });

    archive.on('error', err => {
      reject(err);
    });

    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        archive.append(buffer, { name: file.name });
      }

      await archive.finalize();
    } catch (err) {
      reject(err);
    }
  });
};

import archiver from 'archiver';
import { file, z } from 'zod/v4';

export const ZipFileSchema = z
  .file()
  .refine(file => file.type === 'application/zip', {
    message: 'File must be a zip file',
  })
  .refine(file => file.name.endsWith('.zip'), {
    message: 'File name must end with .zip',
  });

export const ImageFileSchema = z
  .file()
  .refine(file => file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg', {
    message: 'File must be an image file',
  })
  .refine(file => file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg'), {
    message: 'File name must end with .png, .jpg, or .jpeg',
  });

export const PowerpointTemplateSchema = z
  .file()
  .refine(
    file =>
      file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      file.type === 'application/vnd.ms-powerpoint',
    {
      message: 'File must be a PowerPoint file (.pptx or .ppt)',
    },
  )
  .refine(file => file.name.endsWith('.pptx') || file.name.endsWith('.ppt'), {
    message: 'File name must end with .pptx or .ppt',
  });

export const saveFile = async (filePath: string, file: File): Promise<void> => {
  const arrayBuffer = await file.arrayBuffer();
  await Bun.write(filePath, arrayBuffer);
};

export const loadFile = async (filePath: string, filename: string, mimeType: string): Promise<File> => {
  const bunFile = Bun.file(filePath);
  const exists = await bunFile.exists();

  if (!exists) {
    throw new Error(`File not found: ${filePath}`);
  }

  const arrayBuffer = await bunFile.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
};

export async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return base64;
}
export function base64ToFile(dataUrl: string, filename: string = 'screenshot.png'): File {
  const base64 = dataUrl.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');
  const blob = new Blob([buffer], { type: 'image/png' });
  const file = new File([blob], filename, { type: 'image/png' });
  return file;
}

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

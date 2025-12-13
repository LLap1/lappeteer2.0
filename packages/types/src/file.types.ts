import { z } from 'zod/v4';

export const PPTX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
export const ZIP_MIME_TYPE = 'application/zip';

export const PptxFileSchema = z.file();
export const ZipFileSchema = z.file();

export const Base64DataURLSchema = z.string().refine(string => string.startsWith('data:image/png;base64,'), {
  message: 'Invalid base64 data url',
});

export type PptxFile = z.infer<typeof PptxFileSchema>;
export type ZipFile = z.infer<typeof ZipFileSchema>;
export type Base64DataURL = z.infer<typeof Base64DataURLSchema>;

import { z } from 'zod/v4';
import { PptxFileSchema } from './file.types';

export const DocumentSchema = PptxFileSchema;
export const TemplateSchema = PptxFileSchema;
export const TemplatePlaceholderSchema = z.object({
  key: z.string(),
  type: z.string(),
  width: z.coerce.number(),
  height: z.coerce.number(),
});

export type Document = z.infer<typeof DocumentSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type TemplatePlaceholder = z.infer<typeof TemplatePlaceholderSchema>;

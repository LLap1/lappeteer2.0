import { z } from 'zod/v4';
import {
  type Template,
  type PlaceholderMetadata,
  type PlaceholderType,
  DocumentSchema,
} from '@auto-document/types/document';

export const PlaceholderMetadataSchema: z.ZodType<PlaceholderMetadata<PlaceholderType>> = z.object({
  key: z.string(),
  type: z.literal(['map', 'text', 'image']),
  width: z.number(),
  height: z.number(),
});

export const TemplateSchema: z.ZodType<Template> = z.object({
  id: z.uuid(),
  name: z.string(),
  path: z.string(),
  placeholders: z.array(PlaceholderMetadataSchema),
});

export const CreateTemplateInputSchema = z.object({
  file: z.file(),
});

export const CreateTemplateOutputSchema = TemplateSchema;

export const GetTemplateInputSchema = z.object({
  id: z.uuid(),
});

export const GetTemplateOutputSchema = TemplateSchema;

export const ListTemplatesInputSchema = z.object();
export const ListTemplatesOutputSchema = z.array(TemplateSchema);

export const DeleteTemplateInputSchema = z.object({
  id: z.uuid(),
});

export const DownloadTemplateInputSchema = z.object({
  id: z.uuid(),
});

export const DownloadTemplateOutputSchema = z.file();

export const ListDocumentsInputSchema = z.object({
  id: z.uuid(),
});

export const ListDocumentsOutputSchema = z.array(DocumentSchema);

export type CreateTemplateInput = z.infer<typeof CreateTemplateInputSchema>;
export type CreateTemplateOutput = z.infer<typeof CreateTemplateOutputSchema>;
export type GetTemplateInput = z.infer<typeof GetTemplateInputSchema>;
export type GetTemplateOutput = z.infer<typeof GetTemplateOutputSchema>;
export type ListTemplatesInput = z.infer<typeof ListTemplatesInputSchema>;
export type ListTemplatesOutput = z.infer<typeof ListTemplatesOutputSchema>;
export type DeleteTemplateInput = z.infer<typeof DeleteTemplateInputSchema>;
export type DownloadTemplateInput = z.infer<typeof DownloadTemplateInputSchema>;
export type DownloadTemplateOutput = z.infer<typeof DownloadTemplateOutputSchema>;
export type ListDocumentsInput = z.infer<typeof ListDocumentsInputSchema>;
export type ListDocumentsOutput = z.infer<typeof ListDocumentsOutputSchema>;

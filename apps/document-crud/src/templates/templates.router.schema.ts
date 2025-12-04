import { z } from 'zod/v4';
import { TemplatePlaceholderSchema } from '@auto-document/types/document';

export const CreateTemplateInputSchema = z.object({
  file: z.file(),
});

export const CreateTemplateOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  placeholders: z.array(TemplatePlaceholderSchema),
});

export const GetTemplateInputSchema = z.object({
  id: z.string(),
});

export const GetTemplateOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  placeholders: z.array(TemplatePlaceholderSchema),
});

export const ListTemplatesOutputSchema = z.array(GetTemplateOutputSchema);

export const UpdateTemplateInputSchema = z.object({
  id: z.string(),
  placeholders: z.array(TemplatePlaceholderSchema),
});

export const UpdateTemplateOutputSchema = GetTemplateOutputSchema;

export const DeleteTemplateInputSchema = z.object({
  id: z.string(),
});

export const DownloadTemplateInputSchema = z.object({
  id: z.string(),
});

export const DownloadTemplateOutputSchema = z.file();

export type CreateTemplateInput = z.infer<typeof CreateTemplateInputSchema>;
export type CreateTemplateOutput = z.infer<typeof CreateTemplateOutputSchema>;
export type GetTemplateInput = z.infer<typeof GetTemplateInputSchema>;
export type GetTemplateOutput = z.infer<typeof GetTemplateOutputSchema>;
export type ListTemplatesOutput = z.infer<typeof ListTemplatesOutputSchema>;
export type UpdateTemplateInput = z.infer<typeof UpdateTemplateInputSchema>;
export type UpdateTemplateOutput = z.infer<typeof UpdateTemplateOutputSchema>;
export type DeleteTemplateInput = z.infer<typeof DeleteTemplateInputSchema>;
export type DownloadTemplateInput = z.infer<typeof DownloadTemplateInputSchema>;
export type DownloadTemplateOutput = z.infer<typeof DownloadTemplateOutputSchema>;

import { z } from 'zod/v4';
import { TemplateSchema, DocumentSchema, PlaceholderMetadataSchema } from '@auto-document/types/document';
import { PlaceholderSchema } from '@auto-document/types/document';

export const GenerateDocumentInputSchema = z.object({
  template: z.file(),
  filename: z.string(),
  data: z.array(PlaceholderSchema),
});

export const AnalyzeTemplateParamsInputSchema = TemplateSchema;

export const GenerateDocumentOutputSchema = DocumentSchema;
export const AnalyzeTemplateParamsOutputSchema = z.array(PlaceholderMetadataSchema);

export type AnalyzeTemplateParamsInput = z.infer<typeof AnalyzeTemplateParamsInputSchema>;
export type AnalyzeTemplateParamsOutput = z.infer<typeof AnalyzeTemplateParamsOutputSchema>;

export type GenerateDocumentInput = z.infer<typeof GenerateDocumentInputSchema>;
export type GenerateDocumentOuput = z.infer<typeof GenerateDocumentOutputSchema>;

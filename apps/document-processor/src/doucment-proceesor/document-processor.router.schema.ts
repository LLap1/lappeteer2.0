import { z } from 'zod/v4';
import { TemplateSchema, DocumentSchema } from '@auto-document/types/document';

export const GenerateDocumentPlaceholderDataSchema = z.object({
  type: z.enum(['map', 'text', 'image']),
  key: z.string(),
  value: z.string(),
});

export const GenerateDocumentInputSchema = z.object({
  file: TemplateSchema,
  documentFileName: z.string(),
  data: z.array(GenerateDocumentPlaceholderDataSchema),
});

export const GenerateDocumentOutputSchema = DocumentSchema;
export const AnalyzeTemplateParamsInputSchema = TemplateSchema;

export const AnalyzeTemplateParamsOutputSchema = z.array(
  z.object({
    key: z.string(),
    type: z.string(),
    width: z.coerce.number(),
    height: z.coerce.number(),
  }),
);

export type AnalyzeTemplateParamsInput = z.infer<typeof AnalyzeTemplateParamsInputSchema>;
export type AnalyzeTemplateParamsOutput = z.infer<typeof AnalyzeTemplateParamsOutputSchema>;

export type GenerateDocumentPlaceholderData = z.infer<typeof GenerateDocumentPlaceholderDataSchema>;
export type GenerateDocumentInput = z.infer<typeof GenerateDocumentInputSchema>;
export type GenerateDocumentOuput = z.infer<typeof GenerateDocumentOutputSchema>;

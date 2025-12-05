import { z } from 'zod/v4';
import { TemplateSchema, DocumentSchema } from '@auto-document/types/document';
import { Base64DataURLSchema } from '@auto-document/types/file';

export const GenerateDocumentMapPlaceholderDataSchema = z.object({
  type: z.literal('map'),
  key: z.string(),
  value: z.array(Base64DataURLSchema),
});
export const GenerateDocumentTextPlaceholderDataSchema = z.object({
  type: z.literal('text'),
  key: z.string(),
  value: z.string(),
});
export const GenerateDocumentImagePlaceholderDataSchema = z.object({
  type: z.literal('image'),
  key: z.string(),
  value: Base64DataURLSchema,
});

export const GenerateDocumentPlaceholderDataSchema = z.discriminatedUnion('type', [
  GenerateDocumentMapPlaceholderDataSchema,
  GenerateDocumentTextPlaceholderDataSchema,
  GenerateDocumentImagePlaceholderDataSchema,
]);

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

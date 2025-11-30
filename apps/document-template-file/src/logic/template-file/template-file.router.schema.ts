import { z } from 'zod/v4';

export const GenerateTemplatePlaceholderDataSchema = z.object({
  type: z.enum(['map', 'text', 'image']),
  key: z.string(),
  value: z.string(),
});

export const GenerateTemplateInputSchema = z.object({
  file: z
    .instanceof(File)
    .refine(file => file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation', {
      message: 'File must be a PowerPoint presentation (.pptx)',
    }),
  documentFileName: z.string(),
  data: z.array(GenerateTemplatePlaceholderDataSchema),
});

export const GenerateTemplateOutputSchema = z
  .instanceof(File)
  .refine(file => file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation', {
    message: 'File must be a PowerPoint presentation (.pptx)',
  });

export const ExtractTemplateParamsInputSchema = z.object({
  file: z
    .instanceof(File)
    .refine(file => file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation', {
      message: 'File must be a PowerPoint presentation (.pptx)',
    }),
});

export const ExtractTemplateParamsOutputSchema = z.array(
  z.object({
    key: z.string(),
    type: z.string(),
    width: z.number(),
    height: z.number(),
  }),
);

export type ExtractTemplateParamsInput = z.infer<typeof ExtractTemplateParamsInputSchema>;
export type ExtractTemplateParamsOutput = z.infer<typeof ExtractTemplateParamsOutputSchema>;

export type GenerateTemplatePlaceholderData = z.infer<typeof GenerateTemplatePlaceholderDataSchema>;
export type GenerateTemplateInput = z.infer<typeof GenerateTemplateInputSchema>;
export type GenerateTemplateOutput = z.infer<typeof GenerateTemplateOutputSchema>;

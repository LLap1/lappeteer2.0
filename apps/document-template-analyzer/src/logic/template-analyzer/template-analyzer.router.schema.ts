import { z } from 'zod/v4';

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


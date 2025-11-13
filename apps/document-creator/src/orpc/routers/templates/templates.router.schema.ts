import { z } from 'zod';
import { PowerpointTemplateSchema } from 'src/models/file.model';

export const DownloadTemplateInputSchema = z.object({
  filename: z.string(),
});

export const DownloadTemplateOutputSchema = PowerpointTemplateSchema;

export const UploadTemplateOutputSchema = z.object({
  filename: z.string(),
  placeholders: z.array(
    z.object({
      key: z.string(),
      width: z.number(),
      height: z.number(),
    }),
  ),
});

export type DownloadTemplateInput = z.infer<typeof DownloadTemplateInputSchema>;
export type DownloadTemplateOutput = z.infer<typeof DownloadTemplateOutputSchema>;

export type UploadTemplateOutput = z.infer<typeof UploadTemplateOutputSchema>;

import { z } from 'zod';
import { PowerpointTemplateSchema } from 'src/models/file.model';

export const DownloadTemplateInputSchema = z.object({
  filename: z.string(),
});

export const DownloadTemplateOutputSchema = PowerpointTemplateSchema;

export type DownloadTemplateInput = z.infer<typeof DownloadTemplateInputSchema>;
export type DownloadTemplateOutput = z.infer<typeof DownloadTemplateOutputSchema>;

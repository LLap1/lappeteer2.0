import { z } from 'zod';
import { PowerpointTemplateSchema } from 'src/models/file.model';

export const DownloadTemplateInputSchema = z.object({
  filename: z.string(),
});

export const DownloadTemplateOutputSchema = PowerpointTemplateSchema;

export const UploadTemplateInputSchema = z
  .object({
    file: z.instanceof(File),
  })
  .loose();

export const UploadTemplateOutputSchema = z.object({
  name: z.string(),
  path: z.string(),
  placeholders: z.array(
    z.object({
      key: z.string(),
      type: z.string(),
      width: z.number(),
      height: z.number(),
    }),
  ),
});

export type DownloadTemplateInput = z.infer<typeof DownloadTemplateInputSchema>;
export type DownloadTemplateOutput = z.infer<typeof DownloadTemplateOutputSchema>;

export type UploadTemplateInput = z.infer<typeof UploadTemplateInputSchema>;
export type UploadTemplateOutput = z.infer<typeof UploadTemplateOutputSchema>;

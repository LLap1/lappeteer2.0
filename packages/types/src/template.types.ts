import { z } from 'zod/v4';

export const TemplatePlaceholderSchema = z.object({
  key: z.string(),
  type: z.string(),
  width: z.number(),
  height: z.number(),
});

export type TemplatePlaceholder = z.infer<typeof TemplatePlaceholderSchema>;

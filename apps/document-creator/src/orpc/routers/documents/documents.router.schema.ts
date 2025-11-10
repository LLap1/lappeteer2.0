import { z } from 'zod/v4';
import { ZipFileSchema } from 'src/models/file.model';
import { eventIteratorToStream } from '@orpc/client';

export const CreateDocumentsDataMapInputSchema = z.object({
  filename: z.string(),
  center: z.tuple([z.number(), z.number()]),
  zoom: z.number().min(1).max(20).optional(),
  geojson: z.array(z.any()).optional(),
});
export const CreateDocumentsDataStringInputSchema = z.string();

export const CreateDocumentsDataInputSchema = z.array(
  z.object({
    map: z.object({
      type: z.literal('map'),
      key: z.string(),
      value: CreateDocumentsDataMapInputSchema,
    }),
    strings: z.array(
      z.object({
        type: z.literal('string'),
        key: z.string(),
        value: CreateDocumentsDataStringInputSchema,
      }),
    ),
  }),
);

export const CreateDocumentsInputSchema = z.object({
  templateFileName: z.string(),
  data: CreateDocumentsDataInputSchema,
});
export const CreateDocumentsOutputSchema = ZipFileSchema;

export type CreateDocumentsInput = z.infer<typeof CreateDocumentsInputSchema>;
export type CreateDocumentsDataInput = z.infer<typeof CreateDocumentsDataInputSchema>;
export type CreateDocumentsOutput = z.infer<typeof CreateDocumentsOutputSchema>;

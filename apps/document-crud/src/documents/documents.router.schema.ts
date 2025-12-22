import { z } from 'zod/v4';
import { GeoJsonFeatureSchema } from '@auto-document/types/geojson';
import { PlaceholderType, PlaceholderTypeSchema } from '@auto-document/types/document';
import {
  MapPlaceholderParams,
  TextPlaceholderParams,
  ImagePlaceholderParams,
} from './document-creator/placholder-creator/placeholder-creator.model';
import type { Document } from '@auto-document/types/document';
import { v4 as uuidv4 } from 'uuid';
export type CreateDocumentParams = {
  placeholders: CreatePlaceholderParams<PlaceholderType>[];
  documentFilename: string;
};

export type CreatePlaceholderParams<T extends PlaceholderType = PlaceholderType> = {
  id: string;
  type: T;
  key: string;
  params: T extends 'map' ? MapPlaceholderParams : T extends 'text' ? TextPlaceholderParams : ImagePlaceholderParams;
};

export const CreateMapPlaceholderParamsSchema: z.ZodType<MapPlaceholderParams> = z
  .object({
    center: z.tuple([z.coerce.number(), z.coerce.number()]),
    zoom: z.coerce.number().int().min(1).max(20),
    geojson: z.array(GeoJsonFeatureSchema).min(0),
  })
  .strict();

export const CreateTextPlaceholderParamsSchema: z.ZodType<TextPlaceholderParams> = z.string();
export const CreateImagePlaceholderParamsSchema: z.ZodType<ImagePlaceholderParams> = z.url();

export const CreatePlaceholderParamsSchema = z
  .object({
    id: z
      .string()
      .default(() => uuidv4())
      .optional()
      .meta({
        ignore: true,
      }),
    type: PlaceholderTypeSchema,
    key: z.string(),
    params: z.union([
      CreateMapPlaceholderParamsSchema,
      CreateTextPlaceholderParamsSchema,
      CreateImagePlaceholderParamsSchema,
    ]),
  })
  .strict();

export const CreateDocumentParamsSchema = z
  .object({
    placeholders: z.array(CreatePlaceholderParamsSchema),
    documentFilename: z.string(),
  })
  .strict();

export const CreateDocumentsInputSchema = z
  .object({
    templateId: z.string().min(1),
    zipFilename: z.string().min(1),
    params: z.array(CreateDocumentParamsSchema).min(1),
  })
  .strict();

export const CreateDocumentsOutputSchema: z.ZodType<Document> = z.object({
  id: z.string(),
  templateId: z.string(),
  downloadUrl: z.url(),
});

export const DownloadDocumentInputSchema = z.object({
  filePath: z.string().min(1),
});

export const DownloadDocumentOutputSchema = z.file();

const ListDocumentsOutputSchema = z.array(
  z.object({
    id: z.string(),
    templateId: z.string(),
    downloadUrl: z.url(),
  }),
);

export const ListDocumentsAllInputSchema = z.object();
export const ListDocumentsAllOutputSchema = ListDocumentsOutputSchema;
export const ListDocumentsByTemplateIdInputSchema = z.object({ templateId: z.string() });

export const ListDocumentsByTemplateIdOutputSchema = ListDocumentsOutputSchema;

export type DownloadDocumentInput = z.infer<typeof DownloadDocumentInputSchema>;
export type DownloadDocumentOutput = z.infer<typeof DownloadDocumentOutputSchema>;

export type ListDocumentsAllInput = z.infer<typeof ListDocumentsAllInputSchema>;
export type ListDocumentsAllOutput = z.infer<typeof ListDocumentsAllOutputSchema>;

export type ListDocumentsByTemplateIdInput = z.infer<typeof ListDocumentsByTemplateIdInputSchema>;
export type ListDocumentsByTemplateIdOutput = z.infer<typeof ListDocumentsByTemplateIdOutputSchema>;

export type CreateDocumentsInput = {
  templateId: string;
  zipFilename: string;
  params: CreateDocumentParams[];
};
export type CreateDocumentsOutput = z.infer<typeof CreateDocumentsOutputSchema>;

import { z } from 'zod/v4';
import { GeoJsonFeatureSchema } from '@auto-document/types/geojson';
import { PlaceholderType, PlaceholderTypeSchema } from '@auto-document/types/document';
import {
  MapPlaceholderParams,
  TextPlaceholderParams,
  ImagePlaceholderParams,
} from './document-creator/placholder-creator/placeholder-creator.model';
import { v4 as uuidv4 } from 'uuid';

export type CreateDocumentParams = {
  placeholders: CreatePlaceholderParams<PlaceholderType>[];
  documentFilename: string;
  slidesToRemove?: number[];
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

//@ts-ignore id is present...
export const CreatePlaceholderParamsSchema: z.ZodType<CreatePlaceholderParams> = z
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
    slidesToRemove: z.array(z.number().int().nonnegative()).optional(),
  })
  .strict();

export const CreateDocumentsInputSchema = z
  .object({
    templateId: z.string().min(1),
    zipFilename: z.string().min(1),
    params: z.array(CreateDocumentParamsSchema).min(1),
  })
  .strict();

export const CreateDocumentsOutputSchema = z.object({
  downloadUrl: z.url(),
});

export const DownloadDocumentInputSchema = z.object({
  id: z.string().min(1),
});

export const DownloadDocumentOutputSchema = z.object({
  downloadUrl: z.url(),
});

const ListDocumentsOutputSchema = z.array(
  z.object({
    id: z.string(),
    templateId: z.string(),
    downloadUrl: z.url(),
  }),
);

export const GetDocumentByIdInputSchema = z.object({ id: z.string() });
export const GetDocumentByIdOutputSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  downloadUrl: z.url(),
});

export const DeleteDocumentByIdInputSchema = z.object({ id: z.string() });
export const DeleteDocumentByIdOutputSchema = z.void();

export const ListDocumentsAllOutputSchema = ListDocumentsOutputSchema;
export const ListDocumentsByTemplateIdInputSchema = z.object({ templateId: z.string() });

export const ListDocumentsByTemplateIdOutputSchema = ListDocumentsOutputSchema;

export type DownloadDocumentInput = z.infer<typeof DownloadDocumentInputSchema>;
export type DownloadDocumentOutput = z.infer<typeof DownloadDocumentOutputSchema>;

export type ListDocumentsAllOutput = z.infer<typeof ListDocumentsAllOutputSchema>;

export type ListDocumentsByTemplateIdInput = z.infer<typeof ListDocumentsByTemplateIdInputSchema>;
export type ListDocumentsByTemplateIdOutput = z.infer<typeof ListDocumentsByTemplateIdOutputSchema>;

export type DeleteDocumentByIdInput = z.infer<typeof DeleteDocumentByIdInputSchema>;
export type DeleteDocumentByIdOutput = z.infer<typeof DeleteDocumentByIdOutputSchema>;

export type GetDocumentByIdInput = z.infer<typeof GetDocumentByIdInputSchema>;
export type GetDocumentByIdOutput = z.infer<typeof GetDocumentByIdOutputSchema>;

export type CreateDocumentsInput = {
  templateId: string;
  zipFilename: string;
  params: CreateDocumentParams[];
};
export type CreateDocumentsOutput = z.infer<typeof CreateDocumentsOutputSchema>;

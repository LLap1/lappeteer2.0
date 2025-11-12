import z from 'zod';
import { ImageFileSchema, PowerpointTemplateSchema } from './file.model';

export const DocumentMapSchema = ImageFileSchema;
export const DocumentTemplateSchema = PowerpointTemplateSchema;
export type DocumentMap = z.infer<typeof DocumentMapSchema>;
export type DocumentTemplate = z.infer<typeof DocumentTemplateSchema>;

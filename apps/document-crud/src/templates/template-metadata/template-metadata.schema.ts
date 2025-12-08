import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { PlaceholderMetadata, PlaceholderType } from '@auto-document/types/document';

export type TemplateMetadataDocument = TemplateMetadata & Document;

@Schema({ collection: 'template_metadata' })
export class TemplateMetadata {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true })
  path!: string;

  @Prop({
    type: [
      {
        key: { type: String, required: true },
        type: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
      },
    ],
    required: true,
  })
  placeholders!: PlaceholderMetadata<PlaceholderType>[];
}

export const TemplateMetadataSchema = SchemaFactory.createForClass(TemplateMetadata);

export type TemplateMetadataType = {
  id: string;
  name: string;
  path: string;
  placeholders: PlaceholderMetadata<PlaceholderType>[];
};

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DocumentTemplatePlaceholder } from '../template-parser/template-parser.model';

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
  placeholders!: {
    key: string;
    type: string;
    width: number;
    height: number;
  }[];
}

export const TemplateMetadataSchema = SchemaFactory.createForClass(TemplateMetadata);

export type TemplateMetadataType = {
  name: string;
  path: string;
  placeholders: DocumentTemplatePlaceholder[];
};

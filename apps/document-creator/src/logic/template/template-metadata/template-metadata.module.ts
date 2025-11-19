import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateMetadataService } from './template-metadata.service';
import { TemplateMetadata, TemplateMetadataSchema } from './template-metadata.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: TemplateMetadata.name, schema: TemplateMetadataSchema }])],
  providers: [TemplateMetadataService],
  exports: [TemplateMetadataService],
})
export class TemplateMetadataModule {}

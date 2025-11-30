import { Module } from '@nestjs/common';
import { TemplateMetadataService } from './template-metadata.service';
import { TemplateMetadata, TemplateMetadataSchema } from './template-metadata.schema';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [MongooseModule.forFeature([{ name: TemplateMetadata.name, schema: TemplateMetadataSchema }])],
  providers: [TemplateMetadataService],
  exports: [TemplateMetadataService],
})
export class TemplateMetadataModule {}

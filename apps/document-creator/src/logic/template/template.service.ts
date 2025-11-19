import { Injectable } from '@nestjs/common';
import { TemplateFileService } from './template-file/template-file.service';
import { TemplateParserService } from './template-parser/template-parser.service';
import { TemplateMetadataType as TemplateMetadata } from './template-metadata/template-metadata.schema';
import { TemplateMetadataService } from './template-metadata/template-metadata.service';

@Injectable()
export class TemplateService {
  constructor(
    private readonly templateFileService: TemplateFileService,
    private readonly templateParserService: TemplateParserService,
    private readonly templateMetadataStorageService: TemplateMetadataService,
  ) {}

  async upload(templateFile: File): Promise<TemplateMetadata> {
    this.templateFileService.upload(templateFile);
    const placeholders = await this.templateParserService.extractParams(templateFile);
    const templateMetadata: TemplateMetadata = {
      name: templateFile.name,
      path: templateFile.name,
      placeholders,
    };
    await this.templateMetadataStorageService.upload(templateMetadata);
    return templateMetadata;
  }

  async download(name: string): Promise<File> {
    const templateMetadata = await this.templateMetadataStorageService.getByName(name);
    const templateFile = await this.templateFileService.download(templateMetadata!.path);
    return templateFile;
  }
}

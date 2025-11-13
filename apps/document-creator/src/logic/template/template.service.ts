import { Injectable } from '@nestjs/common';
import { TemplateFileService } from './template-file-storage/template-file-storage.service';
import { TemplateParserService } from './template-parser/template-parser.service';
import { DocumentTemplatePlaceholder } from './template-parser/template-parser.model';
import { TemplateMetadata } from './template-metadata-storage/template-metadata-storage.model';
import { TemplateMetadataStorageService } from './template-metadata-storage/template-metadata-storage.service';

@Injectable()
export class TemplateService {
  constructor(
    private readonly templateFileService: TemplateFileService,
    private readonly templateParserService: TemplateParserService,
    private readonly templateMetadataStorageService: TemplateMetadataStorageService,
  ) {}

  async upload(templateFile: File): Promise<TemplateMetadata> {
    const filePath = await this.templateFileService.upload(templateFile);
    const placeholders = await this.templateParserService.extractParams(templateFile);
    const templateMetadata: TemplateMetadata = {
      name: templateFile.name,
      path: filePath,
      placeholders,
    };
    return templateMetadata;
  }

  async download(name: string): Promise<File> {
    const templateMetadata = await this.templateMetadataStorageService.getByName(name);
    const templateFile = await this.templateFileService.download(templateMetadata!.path);
    return templateFile;
  }
}

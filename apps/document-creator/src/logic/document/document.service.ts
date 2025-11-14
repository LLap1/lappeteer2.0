import { Injectable } from '@nestjs/common';
import { CreateDocumentInput } from 'src/orpc/routers/documents/documents.router.schema';
import { zipFiles } from 'src/models/file.model';
import { TemplateFileService } from '../template/template-file-storage/template-file-storage.service';
import { TemplateMetadataStorageService } from '../template/template-metadata-storage/template-metadata-storage.service';
import { DocumentGeneratorService } from './document-generator/document-generator.service';
import { DocumentParamsCreatorService } from './document-params-creator/document-params-creator.service';

@Injectable()
export class DocumentService {
  constructor(
    private readonly documnetGenerator: DocumentGeneratorService,
    private readonly templateFileService: TemplateFileService,
    private readonly templateMetadataStorageService: TemplateMetadataStorageService,
    private readonly documentParamsCreatorService: DocumentParamsCreatorService,
  ) {}

  async create(input: CreateDocumentInput): Promise<File> {
    const templateFile = await this.templateFileService.download(input.templateFileName);
    const metadata = await this.templateMetadataStorageService.getByName(input.templateFileName);
    const params = await this.documentParamsCreatorService.create(input.data, metadata!.placeholders);
    const document = await this.documnetGenerator.generate({
      templateFile,
      data: params,
      filename: input.templateFileName,
    });
    return document;
  }
}

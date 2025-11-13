import { Injectable } from '@nestjs/common';
import { CreateDocumentsInput, CreateDocumentsOutput } from 'src/orpc/routers/documents/documents.router.schema';

import { DocumentMapCreatorService } from './document-map-creator/document-map-creator.service';
import { zipFiles } from 'src/models/file.model';
import { TemplateFileService } from '../template/template-file-storage/template-file-storage.service';
import { TemplateMetadataStorageService } from '../template/template-metadata-storage/template-metadata-storage.service';
import { DocumentGeneratorService } from './document-generator/document-generator.service';
import { DocumentParamsCreatorService } from './document-params-creator/document-params-creator.service';

@Injectable()
export class DocumentService {
  constructor(
    private readonly documnetGenerator: DocumentGeneratorService,
    private readonly documentDataCreatorService: DocumentMapCreatorService,
    private readonly templateFileService: TemplateFileService,
    private readonly templateMetadataStorageService: TemplateMetadataStorageService,
    private readonly documentParamsCreatorService: DocumentParamsCreatorService,
  ) {}

  async create(input: CreateDocumentsInput): Promise<CreateDocumentsOutput> {
    const templateFile = await this.templateFileService.download(input.templateFileName);
    const metadata = await this.templateMetadataStorageService.getByName(input.templateFileName);
    const params = await this.documentParamsCreatorService.create(input, metadata!.placeholders);
    const maps = await this.documentDataCreatorService.create(params);
    const documents = await Promise.all(data.map(d => this.documnetGenerator.generate({ templateFile, data: d })));
    return zipFiles(documents);
  }
}

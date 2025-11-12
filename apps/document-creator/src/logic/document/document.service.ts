import { Injectable } from '@nestjs/common';
import { CreateDocumentsInput, CreateDocumentsOutput } from 'src/orpc/routers/documents/documents.router.schema';

import { DocumentDataCreatorService } from '../document-data-creator/document-data-creator.service';
import { DocumentTemplateParserService } from '../document-template-parser/document-template-parser.service';
import { zipFiles } from 'src/models/file.model';
import { DocumentTemplateStorageService } from '../document-template-storage/document-template-storage.service';

@Injectable()
export class DocumentService {
  constructor(
    private readonly documentTemplateParserService: DocumentTemplateParserService,
    private readonly documentDataCreatorService: DocumentDataCreatorService,
    private readonly documentTemplateStorageService: DocumentTemplateStorageService,
  ) {}

  async create(inputs: CreateDocumentsInput): Promise<CreateDocumentsOutput> {
    const data = await this.documentDataCreatorService.create(inputs.data);
    const templateFile = await this.documentTemplateStorageService.download(inputs.templateFileName);
    const documents = await Promise.all(
      data.map(d => this.documentTemplateParserService.parse({ templateFile, data: d })),
    );
    const zipedDocuments = await zipFiles(documents);
    return zipedDocuments;
  }
}

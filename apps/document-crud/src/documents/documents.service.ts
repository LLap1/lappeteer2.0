import { Inject, Injectable } from '@nestjs/common';
import { TemplateService } from '../templates/templates.service';
import type { CreateDocumentsInput, CreateDocumentsOutput } from './documents.router.schema';
import { DocumentCreatorService } from './document-creator/document-creator.service';
import { zipFiles } from '@auto-document/utils/file';
import { Span } from 'nestjs-otel';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly templateService: TemplateService,
    private readonly documentCreatorService: DocumentCreatorService,
  ) {}

  @Span()
  async create(input: CreateDocumentsInput): Promise<CreateDocumentsOutput> {
    const templateMetadata = await this.templateService.get({ id: input.templateId });
    if (!templateMetadata) {
      throw new Error(`Template with id ${input.templateId} not found`);
    }

    const templateFile = await this.templateService.download({ id: input.templateId });

    const documentFiles = await this.documentCreatorService.create(input, templateMetadata.placeholders, templateFile);

    const zippedDocuments = await zipFiles(documentFiles, input.zipFileName);
    return zippedDocuments;
  }
}

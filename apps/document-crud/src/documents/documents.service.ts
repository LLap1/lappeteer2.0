import { Inject, Injectable } from '@nestjs/common';
import { TemplateService } from '../templates/templates.service';
import type { CreateDocumentsInput, CreateDocumentsOutput, DownloadDocumentInput } from './documents.router.schema';
import { DocumentCreatorService } from './document-creator/document-creator.service';
import { zipFiles } from '@auto-document/utils/file';
import { FileStorageService } from '@auto-document/nest/file.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly templateService: TemplateService,
    private readonly documentCreatorService: DocumentCreatorService,
    private readonly fileStorageService: FileStorageService,
    @Inject('BASE_URL') private readonly baseUrl: string,
  ) {}

  async create(input: CreateDocumentsInput): Promise<CreateDocumentsOutput> {
    const templateMetadata = await this.templateService.get({ id: input.templateId });

    if (!templateMetadata) {
      throw new Error(`Template with id ${input.templateId} not found`);
    }

    const templateFile = await this.templateService.download({ id: input.templateId });
    const documentFiles = await this.documentCreatorService.create({
      template: templateFile,
      params: input.params,
      placeholderMetadata: templateMetadata.placeholders,
    });

    const zippedDocuments = await zipFiles(documentFiles, input.zipFilename);
    const filePath = `${uuidv4()}/${input.zipFilename}`;
    await this.fileStorageService.upload(zippedDocuments, filePath);
    const downloadUrl = new URL('/documents', this.baseUrl);
    downloadUrl.searchParams.set('filePath', filePath);
    return {
      url: downloadUrl.toString(),
    };
  }

  async download(input: DownloadDocumentInput): Promise<File> {
    return this.fileStorageService.download(input.filePath);
  }
}

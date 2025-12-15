import { Inject, Injectable, Logger } from '@nestjs/common';
import { TemplateService } from '../templates/templates.service';
import type { CreateDocumentsInput, CreateDocumentsOutput, DownloadDocumentInput } from './documents.router.schema';
import { DocumentCreatorService } from './document-creator/document-creator.service';
import { zipFiles } from '@auto-document/utils/file';
import { v4 as uuidv4 } from 'uuid';
import { Log } from '@auto-document/utils/log';
import { S3Service } from '@auto-document/nest/s3.service';

@Injectable()
export class DocumentsService {
  private static readonly logger: Logger = new Logger(DocumentsService.name);

  constructor(
    private readonly templateService: TemplateService,
    private readonly documentCreatorService: DocumentCreatorService,
    private readonly s3Service: S3Service,
    @Inject('BASE_URL') private readonly baseUrl: string,
  ) {}

  @Log(DocumentsService.logger)
  async create(input: CreateDocumentsInput): Promise<CreateDocumentsOutput> {
    const templateMetadata = await this.templateService.get({ id: input.templateId });

    if (!templateMetadata) {
      throw new Error(`Template with id ${input.templateId} not found`);
    }

    const templateFile = await this.templateService.download({ id: input.templateId });
    const documentFiles = await this.documentCreatorService.create({
      file: templateFile,
      params: input.params,
      placeholderMetadata: templateMetadata.placeholders,
    });

    const zippedDocumentsBlob = await zipFiles(documentFiles);
    const zippedDocumentsFile = new File([zippedDocumentsBlob], input.zipFilename, { type: zippedDocumentsBlob.type });
    const filePath = `documents/${uuidv4()}/${input.zipFilename}`;
    await this.s3Service.upload(zippedDocumentsFile, filePath);
    const downloadUrl = new URL('documents', this.baseUrl);
    downloadUrl.searchParams.set('filePath', filePath);
    return {
      url: downloadUrl.toString(),
    };
  }

  @Log(DocumentsService.logger)
  async download(input: DownloadDocumentInput): Promise<File> {
    return this.s3Service.download(input.filePath);
  }
}

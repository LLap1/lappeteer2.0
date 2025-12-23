import { Inject, Injectable, Logger } from '@nestjs/common';
import { TemplateService } from '../templates/templates.service';
import type {
  CreateDocumentsInput,
  CreateDocumentsOutput,
  DownloadDocumentInput,
  ListDocumentsAllOutput,
  ListDocumentsByTemplateIdInput,
  ListDocumentsByTemplateIdOutput,
} from './documents.router.schema';
import { DocumentCreatorService } from './document-creator/document-creator.service';
import { v4 as uuidv4 } from 'uuid';
import { Log } from '@auto-document/utils/log';
import { S3Service } from '@auto-document/nest/s3.service';
import { DRIZZLE } from '@auto-document/nest/drizzle.module';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { documentsTable } from 'src/schemas/document.schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import { appRouter } from 'src/app.router';
import { type RouterErrorMap } from '@auto-document/types/orpc';
import { firstValueFrom, switchMap, tap } from 'rxjs';

@Injectable()
export class DocumentsService {
  private static readonly logger: Logger = new Logger(DocumentsService.name);

  constructor(
    private readonly templateService: TemplateService,
    private readonly documentCreatorService: DocumentCreatorService,
    private readonly s3Service: S3Service,
    @Inject('BASE_URL')
    private readonly baseUrl: string,
    @Inject(DRIZZLE)
    private readonly db: PostgresJsDatabase,
  ) {}

  @Log(DocumentsService.logger)
  async create(
    input: CreateDocumentsInput,
    errors: RouterErrorMap<typeof appRouter.documents.create>,
  ): Promise<CreateDocumentsOutput> {
    const template = await this.templateService.get({ id: input.templateId }, errors);
    const templateFile = await this.templateService.download({ id: input.templateId }, errors);

    const downloadPath = path.join('documents', template.id, new Date().toISOString(), input.zipFilename);
    const downloadUrl = new URL('documents', this.baseUrl);
    downloadUrl.searchParams.set('filePath', downloadPath);

    const zipFile = await this.documentCreatorService.create({
      templateFile,
      params: input.params,
      placeholderMetadata: template.placeholders,
      zipFilename: input.zipFilename,
    });

    await this.s3Service.upload(zipFile, downloadPath);

    const [document] = await this.db
      .insert(documentsTable)
      .values({
        id: uuidv4(),
        templateId: template.id,
        downloadUrl: downloadUrl.toString(),
      })
      .returning();

    return document;
  }

  @Log(DocumentsService.logger)
  async download(
    input: DownloadDocumentInput,
    errors: RouterErrorMap<typeof appRouter.documents.download>,
  ): Promise<File> {
    try {
      return this.s3Service.download(input.filePath);
    } catch (error) {
      throw errors.DOCUMENT_NOT_FOUND({ data: { filePath: input.filePath } });
    }
  }

  @Log(DocumentsService.logger)
  async listByTemplateId(input: ListDocumentsByTemplateIdInput): Promise<ListDocumentsByTemplateIdOutput> {
    const result = await this.db.select().from(documentsTable).where(eq(documentsTable.templateId, input.templateId));
    return result as ListDocumentsByTemplateIdOutput;
  }

  @Log(DocumentsService.logger)
  async listAll(): Promise<ListDocumentsAllOutput> {
    const result = await this.db.select().from(documentsTable);
    return result as ListDocumentsAllOutput;
  }
}

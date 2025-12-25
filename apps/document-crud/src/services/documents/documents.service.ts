import { Inject, Injectable, Logger } from '@nestjs/common';
import { TemplateService } from '../templates/templates.service';
import type {
  CreateDocumentsInput,
  CreateDocumentsOutput,
  DownloadDocumentInput,
  ListDocumentsAllOutput,
  ListDocumentsByTemplateIdInput,
  ListDocumentsByTemplateIdOutput,
  DeleteDocumentByIdInput,
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
    try {
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
        slidesToRemove: input.slidesToRemove,
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
    } catch (error) {
      console.error(error);
      throw errors.DOCUMENT_CREATION_FAILED({ data: { error, templateId: input.templateId } });
    }
  }

  @Log(DocumentsService.logger)
  async download(
    input: DownloadDocumentInput,
    errors: RouterErrorMap<typeof appRouter.documents.download>,
  ): Promise<File> {
    try {
      return this.s3Service.download(input.filePath);
    } catch (error) {
      throw errors.DOCUMENT_NOT_FOUND({ data: { error, filePath: input.filePath } });
    }
  }

  @Log(DocumentsService.logger)
  async listByTemplateId(
    input: ListDocumentsByTemplateIdInput,
    errors: RouterErrorMap<typeof appRouter.documents.listByTemplateId>,
  ): Promise<ListDocumentsByTemplateIdOutput> {
    try {
      const result = await this.db.select().from(documentsTable).where(eq(documentsTable.templateId, input.templateId));
      return result as ListDocumentsByTemplateIdOutput;
    } catch (error) {
      throw errors.DOCUMENT_LIST_BY_TEMPLATE_ID_FAILED({ data: { error, templateId: input.templateId } });
    }
  }

  @Log(DocumentsService.logger)
  async listAll(errors: RouterErrorMap<typeof appRouter.documents.listAll>): Promise<ListDocumentsAllOutput> {
    try {
      const result = await this.db.select().from(documentsTable);
      return result as ListDocumentsAllOutput;
    } catch (error) {
      throw errors.DOCUMENT_LIST_ALL_FAILED({ data: { error } });
    }
  }

  @Log(DocumentsService.logger)
  async deleteById(
    input: DeleteDocumentByIdInput,
    errors: RouterErrorMap<typeof appRouter.documents.deleteById>,
  ): Promise<void> {
    try {
      await this.db.delete(documentsTable).where(eq(documentsTable.id, input.id));
    } catch (error) {
      throw errors.DOCUMENT_DELETION_BY_ID_FAILED({ data: { error, documentId: input.id } });
    }
  }

  @Log(DocumentsService.logger)
  async deleteAll(errors: RouterErrorMap<typeof appRouter.documents.deleteAll>): Promise<void> {
    try {
      await this.db.delete(documentsTable);
    } catch (error) {
      throw errors.DOCUMENT_DELETION_ALL_FAILED({ data: { error } });
    }
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import type {
  CreateDocumentsInput,
  CreateDocumentsOutput,
  DeleteDocumentByIdInput,
  GetDocumentByIdInput,
  GetDocumentByIdOutput,
  ListDocumentsAllOutput,
} from './documents.router.schema';
import { DocumentCreatorService } from './document-creator/document-creator.service';
import { v4 as uuidv4 } from 'uuid';
import { Log } from '@auto-document/utils/log';
import { DRIZZLE } from '@auto-document/nest/drizzle.module';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { documentsTable } from 'src/schemas/documents.schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import { appRouter } from 'src/app.router';
import { type RouterErrorMap } from '@auto-document/types/orpc';
import { S3Client } from 'bun';
import { templatesTable } from 'src/schemas/templates.schema';

@Injectable()
export class DocumentsService {
  private static readonly logger: Logger = new Logger(DocumentsService.name);

  constructor(
    private readonly documentCreatorService: DocumentCreatorService,
    private readonly s3Client: S3Client,
    @Inject(DRIZZLE)
    private readonly db: PostgresJsDatabase,
  ) {}

  @Log(DocumentsService.logger)
  async create(
    input: CreateDocumentsInput,
    errors: RouterErrorMap<typeof appRouter.documents.create>,
  ): Promise<CreateDocumentsOutput> {
    const [template] = await this.db.select().from(templatesTable).where(eq(templatesTable.id, input.templateId));

    if (!template) {
      throw errors.TEMPLATE_NOT_FOUND({ data: { templateId: input.templateId } });
    }

    try {
      const templateFile = this.s3Client.file(template.filePath);

      const filePath = path.join('documents', template.id, new Date().toISOString(), input.zipFilename);

      const zipFile = await this.documentCreatorService.create({
        templateFile,
        params: input.params,
        placeholderMetadata: template.placeholders,
        zipFilename: input.zipFilename,
      });

      await this.s3Client.write(filePath, zipFile, {
        type: zipFile.type,
      });

      const downloadUrl = this.s3Client.presign(filePath, {
        expiresIn: 7 * 24 * 60 * 60, // 7 days
        acl: 'public-read',
        type: zipFile.type,
      });

      await this.db.insert(documentsTable).values({
        id: uuidv4(),
        templateId: template.id,
        filePath,
      });

      return {
        downloadUrl,
      };
    } catch (error) {
      console.error(error);
      throw errors.DOCUMENT_CREATION_FAILED({ data: { error, templateId: input.templateId } });
    }
  }

  @Log(DocumentsService.logger)
  async getById(
    input: GetDocumentByIdInput,
    errors: RouterErrorMap<typeof appRouter.documents.getById>,
  ): Promise<GetDocumentByIdOutput> {
    const [document] = await this.db.select().from(documentsTable).where(eq(documentsTable.id, input.id));

    if (!document) {
      throw errors.DOCUMENT_NOT_FOUND({ data: { documentId: input.id } });
    }

    return {
      ...document,
      downloadUrl: this.s3Client.file(document.filePath).presign(),
    };
  }

  @Log(DocumentsService.logger)
  async list(errors: RouterErrorMap<typeof appRouter.documents.list>): Promise<ListDocumentsAllOutput> {
    try {
      const documents = await this.db.select().from(documentsTable);
      console.log(documents);
      return documents.map(document => ({
        ...document,
        downloadUrl: this.s3Client.file(document.filePath).presign(),
      }));
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
      const [document] = await this.db.select().from(documentsTable).where(eq(documentsTable.id, input.id));

      if (!document) {
        throw errors.DOCUMENT_NOT_FOUND({ data: { documentId: input.id } });
      }

      await this.s3Client.delete(document.filePath);
      await this.db.delete(documentsTable).where(eq(documentsTable.id, input.id));
    } catch (error) {
      throw errors.DOCUMENT_DELETION_BY_ID_FAILED({ data: { error, documentId: input.id } });
    }
  }
}

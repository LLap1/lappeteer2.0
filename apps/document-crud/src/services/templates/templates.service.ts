import { Inject, Injectable, Logger } from '@nestjs/common';
import { templatesTable } from '../../schemas/templates.schema';
import {
  type DeleteTemplateInput,
  type DownloadTemplateInput,
  type DownloadTemplateOutput,
  type GetTemplateInput,
  type GetTemplateOutput,
  type ListTemplatesOutput,
  type CreateTemplateInput,
  type CreateTemplateOutput,
  type ListDocumentsInput,
  type ListDocumentsOutput,
} from './templates.router.schema';
import { S3Service } from '@auto-document/nest/s3.service';
import path from 'path';
import { type PlaceholderMetadata, type PlaceholderType, type Template } from '@auto-document/types/document';
import { Log } from '@auto-document/utils/log';
import { DRIZZLE } from '@auto-document/nest/drizzle.module';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { v4 as uuidv4 } from 'uuid';
import { appRouter } from 'src/app.router';
import { type RouterErrorMap } from '@auto-document/types/orpc';
import { DocumentProcessorService } from '../document-processor/document-processor.service';
import { ListDocumentsByTemplateIdInput, ListDocumentsByTemplateIdOutput } from '../documents/documents.router.schema';
import { documentsTable } from 'src/schemas/documents.schema';
@Injectable()
export class TemplateService {
  private static readonly logger: Logger = new Logger(TemplateService.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: PostgresJsDatabase,
    private readonly s3Service: S3Service,
    private readonly documentProcessorService: DocumentProcessorService,
  ) {}

  @Log(TemplateService.logger)
  async create(
    input: CreateTemplateInput,
    errors: RouterErrorMap<typeof appRouter.templates.create>,
  ): Promise<CreateTemplateOutput> {
    const templateId = uuidv4();
    const filename = path.basename(input.file.name!);
    const filepath = path.join('templates', templateId, filename);
    try {
      await this.s3Service.upload(input.file, filepath);

      const response = await this.documentProcessorService.analyze(new Uint8Array(await input.file.arrayBuffer()));

      const placeholders = response.placeholders as PlaceholderMetadata<PlaceholderType>[];

      const [template] = await this.db
        .insert(templatesTable)
        .values({
          id: templateId,
          name: filename,
          path: filepath,
          placeholders,
        })
        .returning();

      return template as Template;
    } catch (error) {
      throw errors.TEMPLATE_UPLOAD_FAILED({
        data: { error, templateId },
      });
    }
  }

  @Log(TemplateService.logger)
  async get(
    input: GetTemplateInput,
    errors: RouterErrorMap<typeof appRouter.templates.get>,
  ): Promise<GetTemplateOutput> {
    const [template] = await this.db.select().from(templatesTable).where(eq(templatesTable.id, input.id));

    if (!template) {
      throw errors.TEMPLATE_NOT_FOUND({ data: { templateId: input.id } });
    }

    return template as Template;
  }

  @Log(TemplateService.logger)
  async list(): Promise<ListTemplatesOutput> {
    const result = await this.db.select().from(templatesTable);
    return result as Template[];
  }

  @Log(TemplateService.logger)
  async delete(input: DeleteTemplateInput, errors: RouterErrorMap<typeof appRouter.templates.delete>): Promise<void> {
    const [template] = await this.db.select().from(templatesTable).where(eq(templatesTable.id, input.id));

    if (!template) {
      throw errors.TEMPLATE_NOT_FOUND({ data: { templateId: input.id } });
    }

    await this.s3Service.delete(template.path);
    await this.db.delete(templatesTable).where(eq(templatesTable.id, input.id));
  }

  @Log(TemplateService.logger)
  async download(
    input: DownloadTemplateInput,
    errors: RouterErrorMap<typeof appRouter.templates.download>,
  ): Promise<DownloadTemplateOutput> {
    const [template] = await this.db.select().from(templatesTable).where(eq(templatesTable.id, input.id));

    if (!template) {
      throw errors.TEMPLATE_NOT_FOUND({ data: { templateId: input.id } });
    }

    return this.s3Service.download(template.path);
  }

  @Log(TemplateService.logger)
  async listDocuments(
    input: ListDocumentsInput,
    errors: RouterErrorMap<typeof appRouter.templates.listDocuments>,
  ): Promise<ListDocumentsOutput> {
    try {
      const result = await this.db.select().from(documentsTable).where(eq(documentsTable.templateId, input.id));
      return result as ListDocumentsOutput;
    } catch (error) {
      throw errors.TEMPLATE_LIST_DOCUMENTS_FAILED({ data: { error, templateId: input.id } });
    }
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { templatesTable } from '../../schemas/templates.schema';
import {
  type DeleteTemplateInput,
  type GetTemplateInput,
  type GetTemplateOutput,
  type ListTemplatesOutput,
  type CreateTemplateInput,
  type CreateTemplateOutput,
} from './templates.router.schema';

import path from 'path';
import { type PlaceholderMetadata, type PlaceholderType } from '@auto-document/types/document';
import { Log } from '@auto-document/utils/log';
import { DRIZZLE } from '@auto-document/nest/drizzle.module';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { v4 as uuidv4 } from 'uuid';
import { type RouterErrorMap } from '@auto-document/types/orpc';
import { DocumentProcessorService } from '../document-processor/document-processor.service';
import { documentsTable } from 'src/schemas/documents.schema';
import { S3Client } from 'bun';
import { templates } from './templates.router';
@Injectable()
export class TemplateService {
  private static readonly logger: Logger = new Logger(TemplateService.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: PostgresJsDatabase,
    private readonly s3Client: S3Client,
    private readonly documentProcessorService: DocumentProcessorService,
  ) {}

  @Log(TemplateService.logger)
  async create(
    input: CreateTemplateInput,
    errors: RouterErrorMap<typeof templates.create>,
  ): Promise<CreateTemplateOutput> {
    try {
      const templateId = uuidv4();
      const filename = path.basename(input.file.name!);
      const filePath = path.join('templates', templateId, filename);

      await this.s3Client.write(filePath, input.file, {
        type: input.file.type,
      });

      const response = await this.documentProcessorService.analyze(new Uint8Array(await input.file.arrayBuffer()));

      const placeholders = response.placeholders as PlaceholderMetadata<PlaceholderType>[];

      const [template] = await this.db
        .insert(templatesTable)
        .values({
          id: templateId,
          name: filename,
          filePath,
          placeholders,
        })
        .returning();

      return {
        ...template,
        downloadUrl: this.s3Client.file(template.filePath).presign(),
      };
    } catch (error) {
      throw errors.TEMPLATE_UPLOAD_FAILED({
        data: { error },
      });
    }
  }

  @Log(TemplateService.logger)
  async get(input: GetTemplateInput, errors: RouterErrorMap<typeof templates.get>): Promise<GetTemplateOutput> {
    const [template] = await this.db.select().from(templatesTable).where(eq(templatesTable.id, input.id));

    if (!template) {
      throw errors.TEMPLATE_NOT_FOUND({ data: { templateId: input.id } });
    }

    return {
      ...template,
      downloadUrl: this.s3Client.file(template.filePath).presign(),
    };
  }

  @Log(TemplateService.logger)
  async list(): Promise<ListTemplatesOutput> {
    const result = await this.db.select().from(templatesTable);
    return result.map(template => ({
      ...template,
      downloadUrl: this.s3Client.file(template.filePath).presign(),
    }));
  }

  @Log(TemplateService.logger)
  async delete({ id }: DeleteTemplateInput, errors: RouterErrorMap<typeof templates.delete>): Promise<void> {
    const [template] = await this.db.select().from(templatesTable).where(eq(templatesTable.id, id));

    if (!template) {
      throw errors.TEMPLATE_NOT_FOUND({ data: { templateId: id } });
    }

    const relatedDocuments = await this.db.select().from(documentsTable).where(eq(documentsTable.templateId, id));

    for (const document of relatedDocuments) {
      await this.s3Client.delete(document.filePath);
    }

    await this.db.delete(documentsTable).where(eq(documentsTable.templateId, id));
    await this.db.delete(templatesTable).where(eq(templatesTable.id, id));
    await this.s3Client.delete(template.filePath);
  }
}

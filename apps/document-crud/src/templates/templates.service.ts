import { Inject, Injectable, Logger } from '@nestjs/common';
import { TemplateMetadataType } from './template-metadata/template-metadata.schema';
import { TemplateMetadataService } from './template-metadata/template-metadata.service';

import {
  type DeleteTemplateInput,
  type DownloadTemplateInput,
  type DownloadTemplateOutput,
  type GetTemplateInput,
  type GetTemplateOutput,
  type ListTemplatesOutput,
  type UpdateTemplateInput,
  type UpdateTemplateOutput,
  type CreateTemplateInput,
} from './templates.router.schema';
import { FileStorageService } from '@auto-document/nest/file.service';
import path from 'path';
import {
  DOCUMENT_PROCESSOR_SERVICE_NAME,
  type DocumentProcessorServiceClient,
} from '@auto-document/types/proto/document-processor';
import { type PlaceholderMetadata, type PlaceholderType } from '@auto-document/types/document';
import { firstValueFrom } from 'rxjs';
import { Log } from '@auto-document/utils/logger';

@Injectable()
export class TemplateService {
  private static readonly logger: Logger = new Logger(TemplateService.name);
  constructor(
    private readonly templateMetadataService: TemplateMetadataService,
    private readonly fileStorageService: FileStorageService,
    @Inject(DOCUMENT_PROCESSOR_SERVICE_NAME)
    private readonly documentProcessorService: DocumentProcessorServiceClient,
  ) {}

  @Log(TemplateService.logger)
  async create(input: CreateTemplateInput): Promise<TemplateMetadataType> {
    const filename = path.basename(input.file.name!);
    const filepath = path.join('/templates', filename);

    await this.fileStorageService.upload(input.file, filepath!);
    const response = await firstValueFrom(
      this.documentProcessorService.analyze({
        file: new Uint8Array(await input.file.arrayBuffer()),
      }),
    );

    const templateMetadata = await this.templateMetadataService.create({
      name: filename,
      path: filepath,
      placeholders: response.placeholders as PlaceholderMetadata<PlaceholderType>[],
    });

    return templateMetadata;
  }

  @Log(TemplateService.logger)
  async get(input: GetTemplateInput): Promise<GetTemplateOutput> {
    const templateMetadata = await this.templateMetadataService.getById(input.id);
    if (!templateMetadata) {
      throw new Error(`Template with id ${input.id} not found`);
    }
    return templateMetadata;
  }

  @Log(TemplateService.logger)
  async list(): Promise<ListTemplatesOutput> {
    return await this.templateMetadataService.list();
  }

  @Log(TemplateService.logger)
  async update(input: UpdateTemplateInput): Promise<UpdateTemplateOutput> {
    const existing = await this.templateMetadataService.getById(input.id);
    if (!existing) {
      throw new Error(`Template with id ${input.id} not found`);
    }
    await this.templateMetadataService.update(input.id, { placeholders: input.placeholders });
    return {
      ...existing,
      placeholders: input.placeholders,
    };
  }

  @Log(TemplateService.logger)
  async delete(input: DeleteTemplateInput): Promise<void> {
    const templateMetadata = await this.templateMetadataService.getById(input.id);
    if (!templateMetadata) {
      throw new Error(`Template with id ${input.id} not found`);
    }
    await this.fileStorageService.delete(templateMetadata.path);
    await this.templateMetadataService.delete(input.id);
  }

  @Log(TemplateService.logger)
  async download(input: DownloadTemplateInput): Promise<DownloadTemplateOutput> {
    const templateMetadata = await this.templateMetadataService.getById(input.id);
    if (!templateMetadata) {
      throw new Error(`Template with id ${input.id} not found`);
    }
    return this.fileStorageService.download(templateMetadata.path);
  }
}

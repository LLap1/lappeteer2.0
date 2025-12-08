import { Inject, Injectable } from '@nestjs/common';
import { TemplateMetadataType } from './template-metadata/template-metadata.schema';
import { TemplateMetadataService } from './template-metadata/template-metadata.service';
import type { Client } from '../orpc';

import {
  DeleteTemplateInput,
  DownloadTemplateInput,
  DownloadTemplateOutput,
  GetTemplateInput,
  GetTemplateOutput,
  ListTemplatesOutput,
  UpdateTemplateInput,
  UpdateTemplateOutput,
  CreateTemplateInput,
} from './templates.router.schema';
import { ORPC_CLIENT } from '@auto-document/nest/orpc-client.module';
import { FileStorageService } from '@auto-document/nest/file.service';

@Injectable()
export class TemplateService {
  constructor(
    private readonly templateMetadataService: TemplateMetadataService,
    private readonly fileStorageService: FileStorageService,
    @Inject(ORPC_CLIENT) private readonly orpcClient: Client,
  ) {}

  async create(input: CreateTemplateInput): Promise<TemplateMetadataType> {
    await this.fileStorageService.upload(input.file, input.file.name);

    const placeholders = await this.orpcClient.documentProcessor.analyze(input.file);

    const templateMetadata = await this.templateMetadataService.create({
      name: input.file.name,
      path: input.file.name,
      placeholders,
    });

    return templateMetadata;
  }

  async get(input: GetTemplateInput): Promise<GetTemplateOutput> {
    const templateMetadata = await this.templateMetadataService.getById(input.id);
    if (!templateMetadata) {
      throw new Error(`Template with id ${input.id} not found`);
    }
    return templateMetadata;
  }

  async list(): Promise<ListTemplatesOutput> {
    return await this.templateMetadataService.list();
  }

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

  async delete(input: DeleteTemplateInput): Promise<void> {
    const templateMetadata = await this.templateMetadataService.getById(input.id);
    if (!templateMetadata) {
      throw new Error(`Template with id ${input.id} not found`);
    }
    await this.fileStorageService.delete(templateMetadata.path);
    await this.templateMetadataService.delete(input.id);
  }

  async download(input: DownloadTemplateInput): Promise<DownloadTemplateOutput> {
    const templateMetadata = await this.templateMetadataService.getById(input.id);
    if (!templateMetadata) {
      throw new Error(`Template with id ${input.id} not found`);
    }
    return await this.fileStorageService.download(templateMetadata.path);
  }
}

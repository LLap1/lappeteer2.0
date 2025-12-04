import { Inject, Injectable } from '@nestjs/common';
import { TemplateFileStorageService } from './template-file-storage/template-file-storage.service';
import { TemplateMetadataType } from './template-metadata/template-metadata.schema';
import { TemplateMetadataService } from './template-metadata/template-metadata.service';
import type { Client } from '../app.module';
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

@Injectable()
export class TemplateService {
  constructor(
    private readonly templateFileService: TemplateFileStorageService,
    private readonly templateMetadataService: TemplateMetadataService,
    @Inject(ORPC_CLIENT) private readonly orpcClient: Client,
  ) {}

  async create(input: CreateTemplateInput): Promise<TemplateMetadataType> {
    await this.templateFileService.upload(input.file);

    const placeholders = await this.orpcClient.documentProcessor.analyze(input);

    const templateMetadata = await this.templateMetadataService.create({
      name: input.file.name,
      path: input.file.name,
      placeholders: placeholders,
    });

    return {
      ...templateMetadata,
      placeholders,
    };
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
    await this.templateFileService.delete(templateMetadata.path);
    await this.templateMetadataService.delete(input.id);
  }

  async download(input: DownloadTemplateInput): Promise<DownloadTemplateOutput> {
    const templateMetadata = await this.templateMetadataService.getById(input.id);
    if (!templateMetadata) {
      throw new Error(`Template with id ${input.id} not found`);
    }
    return await this.templateFileService.download(templateMetadata.path);
  }
}

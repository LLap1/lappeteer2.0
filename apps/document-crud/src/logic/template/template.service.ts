import { Injectable } from '@nestjs/common';
import { TemplateFileService } from './template-file/template-file.service';
import { TemplateMetadataType, TemplatePlaceholder } from './template-metadata/template-metadata.schema';
import { TemplateMetadataService } from './template-metadata/template-metadata.service';
import { OrpcClientService } from '@auto-document/nest/orpc-client.service';
import type { Client } from '../root.client';
import { GetTemplateInput, UpdateTemplateInput, UpdateTemplateOutput } from './template.router.schema';
import { DeleteTemplateInput, GetTemplateOutput, ListTemplatesOutput } from './template.router.schema';
import { DownloadTemplateInput, DownloadTemplateOutput } from './template.router.schema';
@Injectable()
export class TemplateService {
  constructor(
    private readonly templateFileService: TemplateFileService,
    private readonly templateMetadataService: TemplateMetadataService,
    private readonly orpcClient: OrpcClientService<Client>,
  ) {}

  async create(templateFile: File): Promise<TemplateMetadataType> {
    await this.templateFileService.upload(templateFile);

    const templateMetadata = await this.templateMetadataService.create({
      name: templateFile.name,
      path: templateFile.name,
      placeholders: [],
    });

    const placeholders = await this.orpcClient.client.templateFile.templateFile.extractParams({
      file: templateFile,
    });

    await this.templateMetadataService.update(templateMetadata.id, {
      placeholders,
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

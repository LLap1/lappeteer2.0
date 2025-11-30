import { Injectable } from '@nestjs/common';
import { OrpcClientService } from '@auto-document/nest/orpc-client.service';
import { TemplateService } from '../template/template.service';
import type { Client } from '../root.client';
import type { CreateDocumentsInput, CreateDocumentsOutput } from './documents.router.schema';

@Injectable()
export class DocumentService {
  constructor(
    private readonly orpcClient: OrpcClientService<Client>,
    private readonly templateService: TemplateService,
  ) {}

  async create(input: CreateDocumentsInput): Promise<CreateDocumentsOutput> {
    const templateMetadata = await this.templateService.get({ id: input.templateId });
    if (!templateMetadata) {
      throw new Error(`Template with id ${input.templateId} not found`);
    }

    const templateFile = await this.templateService.download({ id: input.templateId });

    return await this.orpcClient.client.documentCreator.documents.create({
      templateFile,
      placeholders: templateMetadata.placeholders,
      data: input.data,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { OrpcClientService } from '@auto-document/nest/orpc-client.service';
import { CreateDocumentsInput, CreateDocumentsOutput } from './documents.router.schema';
import { DocumentParamsTransformerService } from '../document-params-transformer/document-params-transformer.service';
import { zipFiles } from 'src/models/file.model';
import type { RootClient } from '../app.module';

type GenerateTemplatePlaceholderData = Parameters<RootClient['templateFile']['generate']>[0]['data'][number];

@Injectable()
export class DocumentCreatorService {
  constructor(
    private readonly documentParamsTransformer: DocumentParamsTransformerService,
    private readonly orpcClient: OrpcClientService<RootClient>,
  ) {}

  async create(input: CreateDocumentsInput): Promise<CreateDocumentsOutput> {
    const transformedParams = await this.documentParamsTransformer.transform(input, input.placeholders);

    const documentFiles = await Promise.all(
      transformedParams.data.map(data =>
        this.generateDocument(input.templateFile as File, data.filename, data.placeholderData),
      ),
    );

    return await zipFiles(documentFiles);
  }

  private async generateDocument(
    templateFile: File,
    documentFileName: string,
    data: GenerateTemplatePlaceholderData[],
  ): Promise<File> {
    return await this.orpcClient.client.templateFile.generate({
      file: templateFile,
      documentFileName,
      data: data,
    });
  }
}

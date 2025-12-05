import { Inject, Injectable } from '@nestjs/common';
import { ORPC_CLIENT } from '@auto-document/nest/orpc-client.module';
import { DocumentParamsTransformerService } from './document-params-transformer/document-params-transformer.service';
import type { CreateDocumentsInput } from '../documents.router.schema';
import type { TemplatePlaceholder } from '@auto-document/types/document';
import type { PptxFile } from '@auto-document/types/file';
import { Span } from 'nestjs-otel';
import type { Client } from '../../orpc';

@Injectable()
export class DocumentCreatorService {
  constructor(
    private readonly documentParamsTransformer: DocumentParamsTransformerService,
    @Inject(ORPC_CLIENT) private readonly orpcClient: Client,
  ) {}

  @Span()
  async create(
    input: CreateDocumentsInput,
    placeholders: TemplatePlaceholder[],
    templateFile: PptxFile,
  ): Promise<PptxFile[]> {
    const params = await this.documentParamsTransformer.transform(input, placeholders);
    const documentFiles = await Promise.all(
      params.data.map(param =>
        this.orpcClient.documentProcessor.generate({
          file: templateFile,
          documentFileName: param.filename,
          data: param.placeholderData,
        }),
      ),
    );
    return documentFiles;
  }
}

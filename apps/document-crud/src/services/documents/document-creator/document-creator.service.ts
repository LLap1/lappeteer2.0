import { Injectable, Logger } from '@nestjs/common';
import type { CreateDocumentParams } from '../documents.router.schema';
import type { PlaceholderMetadata, PlaceholderType } from '@auto-document/types/document';
import { type PlaceholderParams } from './placholder-creator/placeholder-creator.model';
import { PlaceholderCreatorService } from './placholder-creator/placeholder-creator.service';
import { Log } from '@auto-document/utils/log';
import { zipFiles } from '@auto-document/utils/file';
import { DocumentProcessorService } from '../../document-processor/document-processor.service';
import { GenerateRequest } from '../../document-processor/document-processor.model';
import { S3File } from 'bun';
import { chunk } from 'lodash';

type CreateInput = {
  templateFile: S3File;
  params: CreateDocumentParams[];
  placeholderMetadata: PlaceholderMetadata<PlaceholderType>[];
  zipFilename: string;
};

@Injectable()
export class DocumentCreatorService {
  private static readonly logger: Logger = new Logger(DocumentCreatorService.name);

  constructor(
    private readonly documentProcessorService: DocumentProcessorService,
    private readonly placeholderCreatorService: PlaceholderCreatorService,
  ) {}

  @Log(DocumentCreatorService.logger)
  async create({ templateFile, params, placeholderMetadata, zipFilename }: CreateInput): Promise<File> {
    const placeholderParams = this.buildPlaceholderParams(params, placeholderMetadata);
    const placeholders = await this.placeholderCreatorService.create(placeholderParams);
    const generateRequests: GenerateRequest[] = await Promise.all(
      params.map(async param => ({
        templateFile,
        data: placeholders
          .filter(p => param.placeholders.some(pp => pp.id === p.id))
          .map(placeholder => ({
            ...placeholder,
            value: Array.isArray(placeholder.value) ? JSON.stringify(placeholder.value) : placeholder.value,
          })),
        outputFilename: param.documentFilename,
        slidesToRemove: param.slidesToRemove,
      })),
    );

    const chunks = chunk(generateRequests, 100);
    const documens: Bun.BunFile[] = [];
    for (const chunk of chunks) {
      const documents = await Promise.all(chunk.map(request => this.documentProcessorService.generate(request)));
      documens.push(...documents);
    }

    const zipBlob = await zipFiles(documens);
    console.log(zipBlob);
    return new File([zipBlob], zipFilename, { type: zipBlob.type });
  }

  private buildPlaceholderParams(
    params: CreateDocumentParams[],
    placeholderMetadata: PlaceholderMetadata<PlaceholderType>[],
  ): PlaceholderParams<PlaceholderType>[] {
    const allPlaceholderParams = params.flatMap(param => param.placeholders);
    const merged = allPlaceholderParams.map(placeholder => {
      const metadata = placeholderMetadata.find(m => m.key === placeholder.key);
      if (!metadata) {
        throw new Error(`Placeholder metadata not found for key ${placeholder.key}`);
      }
      return { ...metadata, ...placeholder };
    });
    return merged;
  }
}

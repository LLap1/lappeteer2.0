import { Injectable, Logger } from '@nestjs/common';
import type { CreateDocumentParams } from '../documents.router.schema';
import type { PlaceholderMetadata, PlaceholderType } from '@auto-document/types/document';
import { type PlaceholderParams } from './placholder-creator/placeholder-creator.model';
import { PlaceholderCreatorService } from './placholder-creator/placeholder-creator.service';
import { Log } from '@auto-document/utils/log';
import { zipFiles } from '@auto-document/utils/file';
import { DocumentProcessorService } from '../../document-processor/document-processor.service';
import { GenerateRequest } from '../../document-processor/document-processor.model';

type CreateInput = {
  templateFile: File;
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
        templateFile: new Uint8Array(await templateFile.arrayBuffer()),
        data: placeholders
          .filter(p => param.placeholders.some(pp => pp.id === p.id))
          .map(placeholder => ({
            ...placeholder,
            value: Array.isArray(placeholder.value) ? JSON.stringify(placeholder.value) : placeholder.value,
          })),
        outputFilename: param.documentFilename,
      })),
    );

    const documents = await Promise.all(
      generateRequests.map(request => this.documentProcessorService.generate(request)),
    );

    const zipBlob = await zipFiles(documents);
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

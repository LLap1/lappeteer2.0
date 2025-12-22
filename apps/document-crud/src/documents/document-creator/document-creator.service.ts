import { Inject, Injectable, Logger } from '@nestjs/common';
import type { CreateDocumentParams, CreatePlaceholderParams } from '../documents.router.schema';
import type { PptxFile } from '@auto-document/types/file';
import type { PlaceholderMetadata, PlaceholderType } from '@auto-document/types/document';
import { type PlaceholderParams } from './placholder-creator/placeholder-creator.model';
import { PlaceholderCreatorService } from './placholder-creator/placeholder-creator.service';
import {
  type GenerateDocumentRequest,
  DOCUMENT_PROCESSOR_SERVICE_NAME,
  type DocumentProcessorServiceClient,
} from '@auto-document/types/proto/document-processor';
import { firstValueFrom, map, of } from 'rxjs';
import { Log } from '@auto-document/utils/log';

@Injectable()
export class DocumentCreatorService {
  private static readonly logger: Logger = new Logger(DocumentCreatorService.name);

  constructor(
    @Inject(DOCUMENT_PROCESSOR_SERVICE_NAME)
    private readonly documentProcessorService: DocumentProcessorServiceClient,
    private readonly placeholderCreatorService: PlaceholderCreatorService,
  ) {}

  @Log(DocumentCreatorService.logger)
  async create({
    file: templateFile,
    params,
    placeholderMetadata,
  }: {
    file: File;
    params: CreateDocumentParams[];
    placeholderMetadata: PlaceholderMetadata<PlaceholderType>[];
  }): Promise<PptxFile[]> {
    const allParamsFlattened = params.map(param => param.placeholders).flat();
    const placeholderParams = this.mergePlaceholderWithMetadata(allParamsFlattened, placeholderMetadata);
    const placeholders = await this.placeholderCreatorService.create(placeholderParams);

    const documentFiles = await Promise.all(
      params.map(async param => {
        const matchingParamPlaceholders = placeholders.filter(placeholder =>
          param.placeholders.find(placeholderParam => placeholderParam.id === placeholder.id),
        );

        const input = {
          file: new Uint8Array(await templateFile.arrayBuffer()),
          filename: param.documentFilename,
          data: matchingParamPlaceholders,
        } as GenerateDocumentRequest;

        const fileBuffer = await firstValueFrom(this.documentProcessorService.generate(input));
        const file = new File([new Uint8Array(fileBuffer.file)], param.documentFilename, {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });
        return file;
      }),
    );

    return documentFiles;
  }

  private mergePlaceholderWithMetadata(
    placeholderParams: CreatePlaceholderParams<PlaceholderType>[],
    placeholderMetadata: PlaceholderMetadata<PlaceholderType>[],
  ): PlaceholderParams<PlaceholderType>[] {
    return placeholderParams.map(placeholder => {
      const matchingMetadata = placeholderMetadata.find(metadata => metadata.key === placeholder.key);
      if (!matchingMetadata) {
        throw new Error(`Placeholder metadata not found for key ${placeholder.key}`);
      }
      return { ...matchingMetadata, ...placeholder };
    });
  }
}

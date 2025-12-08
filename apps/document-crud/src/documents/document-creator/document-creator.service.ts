import { Inject, Injectable } from '@nestjs/common';
import { ORPC_CLIENT } from '@auto-document/nest/orpc-client.module';
import type { CreateDocumentParams, CreatePlaceholderParams } from '../documents.router.schema';
import type { PptxFile } from '@auto-document/types/file';
import type { Client } from '../../orpc';
import type { PlaceholderMetadata, PlaceholderType } from '@auto-document/types/document';
import { PlaceholderParams } from './placholder-creator/placeholder-creator.model';
import { PlaceholderCreatorService } from './placholder-creator/placeholder-creator.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentCreatorService {
  constructor(
    @Inject(ORPC_CLIENT) private readonly orpcClient: Client,
    private readonly placeholderCreatorService: PlaceholderCreatorService,
  ) {}

  async create({
    template,
    params,
    placeholderMetadata,
  }: {
    template: File;
    params: CreateDocumentParams[];
    placeholderMetadata: PlaceholderMetadata<PlaceholderType>[];
  }): Promise<PptxFile[]> {
    const allParamsFlattened = params.map(param => param.placeholders).flat();
    const placeholderParams = this.mergePlaceholderWithMetadata(allParamsFlattened, placeholderMetadata);

    const placeholders = await this.placeholderCreatorService.create(placeholderParams);

    const documentFiles = await Promise.all(
      params.map(param => {
        const matchingParamPlaceholders = placeholders.filter(placeholder =>
          param.placeholders.find(placeholderParam => placeholderParam.id === placeholder.id),
        );

        return this.orpcClient.documentProcessor.generate({
          template,
          filename: param.documentFilename,
          data: matchingParamPlaceholders,
        });
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

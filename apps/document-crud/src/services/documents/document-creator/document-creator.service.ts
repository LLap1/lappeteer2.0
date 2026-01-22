import { Injectable, Logger } from '@nestjs/common';
import type { CreateDocumentParams } from '@auto-document/domain/document-crud.schema';
import type { PlaceholderMetadata, PlaceholderType, Placeholder } from '@auto-document/types/document';
import type { PlaceholderParams } from '@auto-document/domain/document-crud.schema';
import { PlaceholderCreatorService } from './placholder-creator/placeholder-creator.service';
import { Log } from '@auto-document/utils/log';
import { zipFiles } from '@auto-document/utils/file';
import { DocumentProcessorService } from '../../document-processor/document-processor.service';
import { GenerateRequest } from '../../document-processor/document-processor.model';
import { S3File } from 'bun';
import { chunk } from 'lodash';
import { unlink } from 'fs/promises';

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
          .map(placeholder => {
            if (Array.isArray(placeholder.value)) {
              return { ...placeholder, value: JSON.stringify(placeholder.value) };
            }
            if (typeof placeholder.value === 'object' && placeholder.value !== null) {
              const imageValue = placeholder.value as { url: string; rotation?: number };
              return {
                ...placeholder,
                value: JSON.stringify([imageValue.url]),
                rotation: imageValue.rotation,
              };
            }
            return { ...placeholder, value: placeholder.value };
          }),
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

    await this.cleanupTempFiles(placeholders);

    const zipBlob = await zipFiles(documens);
    return new File([zipBlob], zipFilename, { type: zipBlob.type });
  }

  private async cleanupTempFiles(placeholders: Placeholder<PlaceholderType>[]): Promise<void> {
    const filePaths: string[] = [];

    for (const p of placeholders) {
      if (p.type === 'map' && Array.isArray(p.value)) {
        filePaths.push(...p.value);
      } else if (p.type === 'image' && typeof p.value === 'object' && p.value !== null) {
        const imageValue = p.value as { url: string; rotation?: number };
        if (imageValue.url.startsWith('/tmp/')) {
          filePaths.push(imageValue.url);
        }
      }
    }

    await Promise.all(filePaths.map(filePath => unlink(filePath).catch(() => {})));
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

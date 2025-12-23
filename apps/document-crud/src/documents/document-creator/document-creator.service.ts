import { Inject, Injectable, Logger } from '@nestjs/common';
import type { CreateDocumentParams, CreatePlaceholderParams } from '../documents.router.schema';
import type { PptxFile } from '@auto-document/types/file';
import type { Placeholder, PlaceholderMetadata, PlaceholderType } from '@auto-document/types/document';
import { type PlaceholderParams } from './placholder-creator/placeholder-creator.model';
import { PlaceholderCreatorService } from './placholder-creator/placeholder-creator.service';
import {
  type GenerateDocumentParams,
  type GeneratedDocument,
  type GenerateResponse,
  DOCUMENT_PROCESSOR_SERVICE_NAME,
  type DocumentProcessorServiceClient,
} from '@auto-document/types/proto/document-processor';
import { from, map, Observable, of, switchMap, take, concatMap, withLatestFrom } from 'rxjs';
import { Log } from '@auto-document/utils/log';
import { zipFiles } from '@auto-document/utils/file';

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
    @Inject(DOCUMENT_PROCESSOR_SERVICE_NAME)
    private readonly documentProcessorService: DocumentProcessorServiceClient,
    private readonly placeholderCreatorService: PlaceholderCreatorService,
  ) {}

  @Log(DocumentCreatorService.logger)
  async create({ templateFile, params, placeholderMetadata, zipFilename }: CreateInput): Promise<File> {
    const filenames = params.map(p => p.documentFilename);

    const files$ = this.buildPlaceholderParams(params, placeholderMetadata).pipe(
      switchMap(placeholderParams => this.placeholderCreatorService.create(placeholderParams)),
      switchMap(placeholders => this.buildGenerateParams(templateFile, params, placeholders)),
      switchMap(generateParams => this.streamDocuments(generateParams, filenames)),
    );

    const zipBlob = await zipFiles(files$);
    return new File([zipBlob], zipFilename, { type: zipBlob.type });
  }

  private buildPlaceholderParams(
    params: CreateDocumentParams[],
    placeholderMetadata: PlaceholderMetadata<PlaceholderType>[],
  ): Observable<PlaceholderParams<PlaceholderType>[]> {
    const allPlaceholderParams = params.flatMap(param => param.placeholders);
    const merged = allPlaceholderParams.map(placeholder => {
      const metadata = placeholderMetadata.find(m => m.key === placeholder.key);
      if (!metadata) {
        throw new Error(`Placeholder metadata not found for key ${placeholder.key}`);
      }
      return { ...metadata, ...placeholder };
    });
    return of(merged);
  }

  private buildGenerateParams(
    templateFile: File,
    params: CreateDocumentParams[],
    placeholders: Placeholder<PlaceholderType>[],
  ): Observable<GenerateDocumentParams[]> {
    return from(templateFile.arrayBuffer()).pipe(
      map(buffer => {
        const templateBytes = new Uint8Array(buffer);
        return params.map(param => ({
          file: templateBytes,
          data: placeholders
            .filter(p => param.placeholders.some(pp => pp.id === p.id))
            .map(p => ({
              id: p.id,
              key: p.key,
              type: p.type,
              value: Array.isArray(p.value) ? JSON.stringify(p.value) : p.value,
              width: p.width,
              height: p.height,
            })),
        }));
      }),
    );
  }

  private streamDocuments(params: GenerateDocumentParams[], filenames: string[]): Observable<PptxFile> {
    const requests$ = from(params).pipe(map(param => ({ params: [param] })));

    return this.documentProcessorService.generate(requests$).pipe(
      take(params.length),
      concatMap((response, index) => from(response.documents).pipe(map(doc => this.toFile(doc, filenames[index])))),
    );
  }

  private toFile(doc: GeneratedDocument, filename: string): PptxFile {
    const buffer = doc.file.buffer.slice(doc.file.byteOffset, doc.file.byteOffset + doc.file.byteLength) as ArrayBuffer;
    return new File([buffer], filename, {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
  }
}

import { Injectable } from '@nestjs/common';
import {
  CreateDocumentInput,
  CreateDocumentsOutput,
  CreateDocumentsInput,
  CreateDocumentData,
  CreateDocumentPlaceholderData,
} from 'src/orpc/routers/documents/documents.router.schema';
import { zipFiles } from 'src/models/file.model';
import { TemplateFileService } from '../template/template-file-storage/template-file-storage.service';
import { TemplateMetadataStorageService } from '../template/template-metadata-storage/template-metadata-storage.service';
import { DocumentGeneratorService } from './document-generator/document-generator.service';
import { DocumentParamsTransformerService } from './document-params-creator/document-params-creator.service';
import { TemplateMetadata } from '../template/template-metadata-storage/template-metadata-storage.model';
import { MapCreatorService } from '../map-creator/map-creator.service';
import { uuidv4 } from 'node_modules/zod/v4/classic/index.cjs';
import { DocumentTemplatePlaceholder } from '../template/template-parser/template-parser.model';
import { GenerateDocumentInput } from './document-generator/document-generator.model';
@Injectable()
export class DocumentService {
  constructor(
    private readonly documnetGenerator: DocumentGeneratorService,
    private readonly templateFileService: TemplateFileService,
    private readonly templateMetadataStorageService: TemplateMetadataStorageService,
    private readonly documentParamsTransformerService: DocumentParamsTransformerService,
  ) {}

  async create(input: CreateDocumentsInput): Promise<CreateDocumentsOutput> {
    const templateFile = await this.templateFileService.download(input.templateFileName);
    const metadata = await this.templateMetadataStorageService.getByName(input.templateFileName);
    const params = await this.documentParamsTransformerService.transform(input, metadata!.placeholders);
    const documentFiles = await Promise.all(
      params.data.map(data =>
        this.documnetGenerator.generate({
          templateFile,
          data: data.placeholderData,
          documentFileName: data.filename,
        }),
      ),
    );
    const documentsZip = await zipFiles(documentFiles);
    return documentsZip;
  }
}

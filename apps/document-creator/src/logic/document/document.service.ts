import { Injectable } from '@nestjs/common';
import { CreateDocumentsOutput, CreateDocumentsInput } from 'src/orpc/routers/documents/documents.router.schema';
import { zipFiles } from 'src/models/file.model';
import { TemplateFileService } from '../template/template-file/template-file.service';
import { TemplateMetadataService } from '../template/template-metadata/template-metadata.service';
import { DocumentGeneratorService } from './document-generator/document-generator.service';
import { DocumentParamsTransformerService } from './document-params-creator/document-params-creator.service';

@Injectable()
export class DocumentService {
  constructor(
    private readonly documnetGenerator: DocumentGeneratorService,
    private readonly templateFileService: TemplateFileService,
    private readonly templateMetadataStorageService: TemplateMetadataService,
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

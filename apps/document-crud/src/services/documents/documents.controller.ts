import { Controller } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { implement, Implement } from '@orpc/nest';
import router from '@auto-document/domain/document-crud.router';
import type {
  CreateDocumentsInput,
  DeleteDocumentByIdInput,
  GetDocumentByIdInput,
} from '@auto-document/domain/document-crud.schema';

@Controller()
export class DocumentsController {
  constructor(private readonly documentService: DocumentsService) {}

  @Implement(router.documents)
  documents() {
    return {
      create: implement(router.documents.create).handler(async ({ input, errors }) => {
        return this.documentService.create(input as CreateDocumentsInput, errors);
      }),
      getById: implement(router.documents.getById).handler(async ({ input, errors }) => {
        return this.documentService.getById(input as GetDocumentByIdInput, errors);
      }),
      list: implement(router.documents.list).handler(async ({ errors }) => {
        return this.documentService.list(errors);
      }),
      deleteById: implement(router.documents.deleteById).handler(async ({ input, errors }) => {
        return this.documentService.deleteById(input as DeleteDocumentByIdInput, errors);
      }),
    };
  }
}

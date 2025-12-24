import { Controller } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { implement, Implement } from '@orpc/nest';
import { appRouter } from 'src/app.router';
import { CreateDocumentsInput } from './documents.router.schema';

@Controller()
export class DocumentsController {
  constructor(private readonly documentService: DocumentsService) {}

  @Implement(appRouter.documents)
  documents() {
    return {
      create: implement(appRouter.documents.create).handler(async ({ input, errors }) => {
        return this.documentService.create(input as CreateDocumentsInput, errors);
      }),
      download: implement(appRouter.documents.download).handler(async ({ input, errors }) => {
        return this.documentService.download(input, errors);
      }),
      listByTemplateId: implement(appRouter.documents.listByTemplateId).handler(async ({ input, errors }) => {
        return this.documentService.listByTemplateId(input, errors);
      }),
      listAll: implement(appRouter.documents.listAll).handler(async ({ errors }) => {
        return this.documentService.listAll(errors);
      }),
      deleteById: implement(appRouter.documents.deleteById).handler(async ({ input, errors }) => {
        return this.documentService.deleteById(input, errors);
      }),
    };
  }
}

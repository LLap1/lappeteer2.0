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
      getById: implement(appRouter.documents.getById).handler(async ({ input, errors }) => {
        return this.documentService.getById(input, errors);
      }),
      list: implement(appRouter.documents.list).handler(async ({ errors }) => {
        return this.documentService.list(errors);
      }),
      deleteById: implement(appRouter.documents.deleteById).handler(async ({ input, errors }) => {
        return this.documentService.deleteById(input, errors);
      }),
    };
  }
}

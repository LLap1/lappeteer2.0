import { Controller } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { implement, Implement } from '@orpc/nest';
import { appRouter } from 'src/app.router';
import { CreateDocumentsInput } from './documents.router.schema';

@Controller()
export class DocumentsController {
  constructor(private readonly documentService: DocumentsService) {}

  @Implement(appRouter.documents.create)
  create() {
    return implement(appRouter.documents.create).handler(async ({ input, errors }) => {
      return this.documentService.create(input as CreateDocumentsInput, errors);
    });
  }

  @Implement(appRouter.documents.download)
  download() {
    return implement(appRouter.documents.download).handler(async ({ input, errors }) => {
      return this.documentService.download(input, errors);
    });
  }

  @Implement(appRouter.documents.listByTemplateId)
  listByTemplateId() {
    return implement(appRouter.documents.listByTemplateId).handler(async ({ input, errors }) => {
      return this.documentService.listByTemplateId(input);
    });
  }

  @Implement(appRouter.documents.listAll)
  listAll() {
    return implement(appRouter.documents.listAll).handler(async () => {
      return this.documentService.listAll();
    });
  }
}

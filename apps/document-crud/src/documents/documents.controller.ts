import { Controller } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { implement, Implement } from '@orpc/nest';
import documentRouter from './documents.router';
import { CreateDocumentsInput } from './documents.router.schema';

@Controller()
export class DocumentsController {
  constructor(private readonly documentService: DocumentsService) {}

  @Implement(documentRouter.create)
  create() {
    return implement(documentRouter.create).handler(async ({ input }) => {
      return this.documentService.create(input as CreateDocumentsInput);
    });
  }

  @Implement(documentRouter.download)
  download() {
    return implement(documentRouter.download).handler(async ({ input }) => {
      return this.documentService.download(input);
    });
  }
}

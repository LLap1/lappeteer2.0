import { Controller } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { implement, Implement } from '@orpc/nest';
import documentRouter from './documents.router';

@Controller()
export class DocumentsController {
  constructor(private readonly documentService: DocumentsService) {}

  @Implement(documentRouter.create)
  create() {
    return implement(documentRouter.create).handler(async ({ input }) => {
      return this.documentService.create(input);
    });
  }
}

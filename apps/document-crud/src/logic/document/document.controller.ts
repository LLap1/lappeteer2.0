import { Controller } from '@nestjs/common';
import { DocumentService } from './document.service';
import { implement, Implement } from '@orpc/nest';
import documentRouter from './documents.router';

@Controller()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Implement(documentRouter.create)
  create() {
    return implement(documentRouter.create).handler(async ({ input }) => {
      return this.documentService.create(input);
    });
  }
}

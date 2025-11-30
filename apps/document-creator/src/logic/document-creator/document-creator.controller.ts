import { Controller } from '@nestjs/common';
import { DocumentCreatorService } from './document-creator.service';
import { implement, Implement } from '@orpc/nest';
import documentCreatorRouter from './documents.router';

@Controller()
export class DocumentCreatorController {
  constructor(private readonly documentCreatorService: DocumentCreatorService) {}

  @Implement(documentCreatorRouter.create)
  create() {
    return implement(documentCreatorRouter.create).handler(async ({ input }) => {
      return this.documentCreatorService.create(input);
    });
  }
}

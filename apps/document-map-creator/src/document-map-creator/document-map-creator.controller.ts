import { Controller } from '@nestjs/common';
import { DocumentMapCreatorService } from './document-map-creator.service';
import { implement, Implement } from '@orpc/nest';
import documentMapCreatorRouter from './document-map-creator.router';

@Controller()
export class DocumentMapCreatorController {
  constructor(private readonly documentMapCreatorService: DocumentMapCreatorService) {}

  @Implement(documentMapCreatorRouter.create)
  create() {
    return implement(documentMapCreatorRouter.create).handler(async ({ input }) => {
      return this.documentMapCreatorService.create(input);
    });
  }
}

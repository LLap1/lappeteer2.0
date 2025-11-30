import { DocumentGeneratorService } from './document-generator.service';
import { Implement } from '@orpc/nest';
import { implement } from '@orpc/server';
import { Controller } from '@nestjs/common';
import appRouter from '../app.router';

@Controller()
export class DocumentGeneratorController {
  constructor(private readonly documentGeneratorService: DocumentGeneratorService) {}

  @Implement(appRouter.generate)
  async generate() {
    return implement(appRouter.generate).handler(async ({ input }) => {
      return this.documentGeneratorService.generateDocument(input);
    });
  }
}

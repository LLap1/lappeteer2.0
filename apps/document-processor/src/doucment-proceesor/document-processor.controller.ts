import { DocumentProcessorService } from './document-processor.service';
import { Implement } from '@orpc/nest';
import { implement } from '@orpc/server';
import { Controller } from '@nestjs/common';
import router from '../app.router';

@Controller()
export class DocumentProcessorController {
  constructor(private readonly documentProcessorService: DocumentProcessorService) {}

  @Implement(router.generate)
  async generate() {
    return implement(router.generate).handler(async ({ input }) => {
      return this.documentProcessorService.generate(input);
    });
  }

  @Implement(router.analyze)
  async analyze() {
    return implement(router.analyze).handler(async ({ input }) => {
      return this.documentProcessorService.analyze(input);
    });
  }
}

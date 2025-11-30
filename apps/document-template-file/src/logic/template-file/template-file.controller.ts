import { TemplateFileService } from './template-file.service';
import { Implement } from '@orpc/nest';
import { implement } from '@orpc/server';
import { Controller } from '@nestjs/common';
import { appRouter } from '../app.router';

@Controller()
export class TemplateFileController {
  constructor(private readonly templateFileService: TemplateFileService) {}

  @Implement(appRouter.generate)
  async generate() {
    return implement(appRouter.generate).handler(async ({ input }) => {
      return this.templateFileService.generateDocument(input);
    });
  }

  @Implement(appRouter.extractParams)
  async extractParams() {
    return implement(appRouter.extractParams).handler(async ({ input }) => {
      return this.templateFileService.extractParams(input.file);
    });
  }
}

import { TemplateAnalyzerService } from './template-analyzer.service';
import { Implement } from '@orpc/nest';
import { implement } from '@orpc/server';
import { Controller } from '@nestjs/common';
import appRouter from '../app.router';

@Controller()
export class TemplateAnalyzerController {
  constructor(private readonly templateAnalyzerService: TemplateAnalyzerService) {}

  @Implement(appRouter.analyze)
  async analyze() {
    return implement(appRouter.analyze).handler(async ({ input }) => {
      return this.templateAnalyzerService.extractParams(input.file);
    });
  }
}

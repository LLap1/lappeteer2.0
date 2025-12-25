import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { TemplateService } from './templates.service';
import { implement, Implement } from '@orpc/nest';
import { appRouter } from 'src/app.router';
@Controller()
export class TemplatesController {
  constructor(private readonly templateService: TemplateService) {}

  @Implement(appRouter.templates)
  templates() {
    return {
      create: implement(appRouter.templates.create).handler(async ({ input, errors }) => {
        return this.templateService.create(input, errors);
      }),
      get: implement(appRouter.templates.get).handler(async ({ input, errors }) => {
        return this.templateService.get(input, errors);
      }),
      list: implement(appRouter.templates.list).handler(async () => {
        return this.templateService.list();
      }),
      delete: implement(appRouter.templates.delete).handler(async ({ input, errors }) => {
        return this.templateService.delete(input, errors);
      }),
      download: implement(appRouter.templates.download).handler(async ({ input, errors }) => {
        return this.templateService.download(input, errors);
      }),
      listDocuments: implement(appRouter.templates.listDocuments).handler(async ({ input, errors }) => {
        return this.templateService.listDocuments(input, errors);
      }),
    };
  }
}

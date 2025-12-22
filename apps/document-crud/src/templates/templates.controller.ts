import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { TemplateService } from './templates.service';
import { implement, Implement } from '@orpc/nest';
import { appRouter } from 'src/app.router';
@Controller()
export class TemplatesController {
  constructor(private readonly templateService: TemplateService) {}

  @Implement(appRouter.templates.create)
  create() {
    return implement(appRouter.templates.create).handler(async ({ input, errors }) => {
      return this.templateService.create({
        file: input.file,
      });
    });
  }

  @Implement(appRouter.templates.get)
  get() {
    return implement(appRouter.templates.get).handler(async ({ input, errors }) => {
      return this.templateService.get(input, errors);
    });
  }

  @Implement(appRouter.templates.list)
  list() {
    return implement(appRouter.templates.list).handler(async () => {
      return this.templateService.list();
    });
  }

  @Implement(appRouter.templates.delete)
  delete() {
    return implement(appRouter.templates.delete).handler(async ({ input, errors }) => {
      return this.templateService.delete(input, errors);
    });
  }

  @Implement(appRouter.templates.download)
  download() {
    return implement(appRouter.templates.download).handler(async ({ input, errors }) => {
      return this.templateService.download(input, errors);
    });
  }
}

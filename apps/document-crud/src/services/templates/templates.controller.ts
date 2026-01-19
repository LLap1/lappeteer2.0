import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { TemplateService } from './templates.service';
import { implement, Implement } from '@orpc/nest';
import router from '@auto-document/domain/document-crud.router';
@Controller()
export class TemplatesController {
  constructor(private readonly templateService: TemplateService) {}

  @Implement(router.templates)
  templates() {
    return {
      create: implement(router.templates.create).handler(async ({ input, errors }) => {
        return this.templateService.create(input, errors);
      }),
      get: implement(router.templates.get).handler(async ({ input, errors }) => {
        return this.templateService.get(input, errors);
      }),
      list: implement(router.templates.list).handler(async () => {
        return this.templateService.list();
      }),
      delete: implement(router.templates.delete).handler(async ({ input, errors }) => {
        return this.templateService.delete(input, errors);
      }),
    };
  }
}

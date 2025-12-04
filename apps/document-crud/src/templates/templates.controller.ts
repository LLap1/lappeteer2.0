import { Controller, Post } from '@nestjs/common';
import { TemplateService } from './templates.service';
import { implement, Implement } from '@orpc/nest';
import templateRouter from './templates.router';

@Controller()
export class TemplatesController {
  constructor(private readonly templateService: TemplateService) {}

  @Implement(templateRouter.create)
  create() {
    return implement(templateRouter.create).handler(async ({ input }) => {
      return this.templateService.create(input);
    });
  }

  @Implement(templateRouter.get)
  get() {
    return implement(templateRouter.get).handler(async ({ input }) => {
      return this.templateService.get(input);
    });
  }

  @Implement(templateRouter.list)
  list() {
    return implement(templateRouter.list).handler(async () => {
      return this.templateService.list();
    });
  }

  @Implement(templateRouter.update)
  update() {
    return implement(templateRouter.update).handler(async ({ input }) => {
      return this.templateService.update(input);
    });
  }

  @Implement(templateRouter.delete)
  delete() {
    return implement(templateRouter.delete).handler(async ({ input }) => {
      return this.templateService.delete(input);
    });
  }

  @Implement(templateRouter.download)
  download() {
    return implement(templateRouter.download).handler(async ({ input }) => {
      return this.templateService.download(input);
    });
  }
}

import { oc } from '@orpc/contract';
import templateFile from './template-file/template-file.router';

export const appRouter = oc.router(templateFile);

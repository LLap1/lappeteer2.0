import documents from './document/documents.router';
import templates from './template/template.router';
import { oc } from '@orpc/contract';

export const appRouter = oc.router({
  documents,
  templates,
});

import { documents } from './services/documents/documents.router';
import { templates } from './services/templates/templates.router';
import { oc } from '@orpc/contract';
import generalErrors from './app.router.errors';

export const appRouter = oc.errors(generalErrors).router({
  documents,
  templates,
});

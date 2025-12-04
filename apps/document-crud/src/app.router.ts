import documents from './documents/documents.router';
import templates from './templates/templates.router';
import { oc } from '@orpc/contract';

const appRouter = oc.router({
  documents,
  templates,
});

export default appRouter;

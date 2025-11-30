import documents from '../logic/document-creator/documents.router';
import { oc } from '@orpc/contract';

const appRouter = oc.router({
  documents,
});

export default appRouter;

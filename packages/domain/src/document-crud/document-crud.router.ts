import { documents } from './documents/documents.router';
import { templates } from './templates/templates.router';
import { oc } from '@orpc/contract';
import generalErrors from './document-crud.errors';




const router = oc.errors(generalErrors).router({
  documents,
  templates,
});

export default router;
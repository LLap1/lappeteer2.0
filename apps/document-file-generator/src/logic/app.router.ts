import { oc } from '@orpc/contract';
import documentGenerator from './document-generator/document-generator.router';

const appRouter = oc.router(documentGenerator);

export default appRouter;


import { oc } from '@orpc/contract';
import documentProcessor from './doucment-proceesor/document-processor.router';
const appRouter = oc.router(documentProcessor);

export default appRouter;

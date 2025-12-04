import maps from './document-map-creator/document-map-creator.router';
import { oc } from '@orpc/contract';

const appRouter = oc.router(maps);
export default appRouter;

import { oc } from '@orpc/contract';
import { appRouter } from './logic/app.router';

const rootContract = oc.router(appRouter);
export default rootContract;

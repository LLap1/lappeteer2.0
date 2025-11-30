import { oc } from '@orpc/contract';
import root from './logic/app.router';

const rootContract = oc.router(root);
export default rootContract;

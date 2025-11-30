import { oc } from '@orpc/contract';
import templateAnalyzer from './template-analyzer/template-analyzer.router';

const appRouter = oc.router(templateAnalyzer);

export default appRouter;

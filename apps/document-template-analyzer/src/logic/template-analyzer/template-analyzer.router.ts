import { ExtractTemplateParamsInputSchema, ExtractTemplateParamsOutputSchema } from './template-analyzer.router.schema';
import { oc } from '@orpc/contract';

const analyze = oc
  .route({
    method: 'POST',
    path: '/analyze',
    summary: 'Extract placeholder parameters from a PowerPoint template',
    tags: ['Templates'],
    description:
      'Analyzes a PowerPoint template file and extracts all placeholder parameters (keys, types, dimensions)',
  })
  .input(ExtractTemplateParamsInputSchema)
  .output(ExtractTemplateParamsOutputSchema);

const router = {
  analyze,
};

export default router;

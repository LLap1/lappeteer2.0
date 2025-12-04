import {
  GenerateDocumentInputSchema as GenerateDocumentInputSchema,
  GenerateDocumentOutputSchema as GenerateDocumentOutputSchema,
  AnalyzeTemplateParamsInputSchema,
  AnalyzeTemplateParamsOutputSchema,
} from './document-processor.router.schema';
import { oc } from '@orpc/contract';

const generate = oc
  .route({
    method: 'POST',
    path: '/generate',
    summary: 'Generate a PowerPoint document from a template',
    tags: ['Documents'],
    description: 'Generates a .pptx file by filling template placeholders with provided data',
  })
  .input(GenerateDocumentInputSchema)
  .output(GenerateDocumentOutputSchema);

const analyze = oc
  .route({
    method: 'POST',
    path: '/analyze',
    summary: 'Extract placeholder parameters from a PowerPoint template',
    tags: ['Templates'],
    description:
      'Analyzes a PowerPoint template file and extracts all placeholder parameters (keys, types, dimensions)',
  })
  .input(AnalyzeTemplateParamsInputSchema)
  .output(AnalyzeTemplateParamsOutputSchema);

const router = {
  generate,
  analyze,
};

export default router;

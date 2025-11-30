import {
  GenerateTemplateInputSchema,
  GenerateTemplateOutput,
  GenerateTemplateOutputSchema,
  ExtractTemplateParamsInputSchema,
  ExtractTemplateParamsOutputSchema,
  ExtractTemplateParamsOutput,
} from './template-file.router.schema';
import { oc } from '@orpc/contract';

const generate = oc
  .route({
    method: 'POST',
    path: '/generate',
    summary: 'Generate a PowerPoint document from a template',
    tags: ['Documents'],
    description: 'Generates a .pptx file by filling template placeholders with provided data',
  })
  .input(GenerateTemplateInputSchema)
  .output(GenerateTemplateOutputSchema);

const extractParams = oc
  .route({
    method: 'POST',
    path: '/extract-params',
    summary: 'Extract placeholder parameters from a PowerPoint template',
    tags: ['Templates'],
    description:
      'Analyzes a PowerPoint template file and extracts all placeholder parameters (keys, types, dimensions)',
  })
  .input(ExtractTemplateParamsInputSchema)
  .output(ExtractTemplateParamsOutputSchema);

const router = {
  generate,
  extractParams,
};

export default router;

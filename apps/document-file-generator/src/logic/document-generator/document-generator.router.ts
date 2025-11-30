import { GenerateTemplateInputSchema, GenerateTemplateOutputSchema } from './document-generator.router.schema';
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

const router = {
  generate,
};

export default router;

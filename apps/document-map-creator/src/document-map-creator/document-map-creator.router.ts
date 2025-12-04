import { oc } from '@orpc/contract';
import { CreateMapsInputSchema, CreateMapsOutputSchema } from './document-map-creator.router.schema';

const create = oc
  .route({
    method: 'POST',
    path: '/create',
    summary: 'Create document maps',
    tags: ['Maps'],
    description: 'Create document maps from provided parameters',
  })
  .input(CreateMapsInputSchema)
  .output(CreateMapsOutputSchema);

const router = oc.router({
  create,
});

export default router;

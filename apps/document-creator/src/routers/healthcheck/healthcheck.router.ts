import { os } from '@orpc/server';

const base = os;

const healthcheck = base
  .route({
    method: 'GET',
    path: '/health',
    summary: 'Check if the backend is alive',
    tags: ['Healthcheck'],
  })
  .handler(async () => {
    return {
      status: 'alive',
    };
  });

const router = {
  healthcheck,
};

export default router;

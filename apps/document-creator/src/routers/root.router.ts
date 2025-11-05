import healthcheck from './healthcheck/healthcheck.router';
import documents from './documents/documents.router';

export const root = {
  healthcheck,
  documents,
};

export default root;

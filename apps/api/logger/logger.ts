import env from '../env';
import winston, { createLogger } from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

export const logger = createLogger({
  format: winston.format.json(),
  transports: [
    new ElasticsearchTransport({
      clientOpts: {
        node: env.ELASTICSEARCH_NODE,
        auth: {
          username: env.ELASTICSEARCH_USERNAME,
          password: env.ELASTICSEARCH_PASSWORD,
        },
        tls: {
          rejectUnauthorized: env.ELASTICSEARCH_SSL_REJECT_UNAUTHORIZED,
        },
      },
    }),
    new winston.transports.Console(),
  ],
});

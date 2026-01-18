import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { ecsFormat } from '@elastic/ecs-winston-format';

export type LoggerConfig = {
  apm: {
    serviceName: string;
    serviceVersion: string;
    serviceEnvironment: string;
  };
  elastic: {
    node: string;
    isDataStream: boolean;
    index: string;
    username: string;
    password: string;
    tls: {
      rejectUnauthorized: boolean;
    };
  };
};

export function createLogger(config: LoggerConfig) {
  const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(winston.format.simple(), winston.format.prettyPrint()),
  });
  const eckTransport = new ElasticsearchTransport({
    format: ecsFormat({
      convertReqRes: true,
      apmIntegration: true,
      serviceName: config.apm.serviceName,
      serviceVersion: config.apm.serviceVersion,
      serviceEnvironment: config.apm.serviceEnvironment,
    }),
    clientOpts: {
      node: config.elastic.node,
      auth: {
        username: config.elastic.username,
        password: config.elastic.password,
      },
      tls: {
        rejectUnauthorized: config.elastic.tls.rejectUnauthorized,
      },
    },
    index: config.elastic.index,
    dataStream: config.elastic.isDataStream,
  });

  const logger = winston.createLogger({
    transports: [consoleTransport, eckTransport],
  });

  return logger;
}

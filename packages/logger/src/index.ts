import { createLogger as createWinstonLogger, transports } from 'winston';
import { ecsFormat } from '@elastic/ecs-winston-format';

export type LoggerConfig = Parameters<typeof createWinstonLogger>[0];

const defaultConfig: LoggerConfig = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
  },
  format: ecsFormat({
    apmIntegration: true,
    serviceName: 'auto-document',
    serviceVersion: '1.0.0',
    serviceEnvironment: 'development',
    serviceNodeName: 'auto-document',
    eventDataset: 'auto-document',
  }),
  transports: [new transports.Console()],
};

export function createLogger(config: LoggerConfig = defaultConfig) {
  return createWinstonLogger(config);
}

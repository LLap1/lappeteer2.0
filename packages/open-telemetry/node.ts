import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import * as process from 'process';
import { ORPCInstrumentation } from '@orpc/otel';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const otelSDK = new NodeSDK({
  traceExporter: new JaegerExporter(),
  spanProcessor: new BatchSpanProcessor(new JaegerExporter()),
  instrumentations: [getNodeAutoInstrumentations(), new ORPCInstrumentation()],
});

export default otelSDK;

// You can also use the shutdown method to gracefully shut down the SDK before process shutdown
// or on some operating system signal.
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      err => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});

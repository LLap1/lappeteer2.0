/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';
import { ORPCInstrumentation } from '@orpc/otel';

const node = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations(), new ORPCInstrumentation()],
});

export default node;

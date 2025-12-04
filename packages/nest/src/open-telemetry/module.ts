import type { OpenTelemetryModuleOptions } from 'nestjs-otel';

export const OtelModuleConfig: OpenTelemetryModuleOptions = {
  metrics: {
    hostMetrics: true, // Includes Host Metrics
    apiMetrics: {
      enable: true,
    },
  },
};

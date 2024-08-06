const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const exporter = new PrometheusExporter({ startServer: true }, () => {
  console.log('Prometheus scrape endpoint: http://localhost:9464/metrics');
});

const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'example-service',
  }),
});

const metricReader = new PeriodicExportingMetricReader({
  exporter,
  exportIntervalMillis: 2000,
});
meterProvider.addMetricReader(metricReader);

const meter = meterProvider.getMeter('example-meter');

const requestCount = meter.createCounter('requests', {
  description: 'Count all incoming requests',
});

function simulateRequest() {
  requestCount.add(1, { service: 'example-service' });
}

setInterval(simulateRequest, 1000);

module.exports = meter;


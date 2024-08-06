const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// Set up the Prometheus exporter
const exporter = new PrometheusExporter({
  startServer: true,
  port: 9464, // Ensure this matches the port Prometheus is scraping
}, () => {
  console.log('Prometheus scrape endpoint: http://localhost:9464/metrics');
});

// Create a MeterProvider and bind the exporter
const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'example-service',
  }),
});

meterProvider.addMetricReader(new PeriodicExportingMetricReader({
  exporter,
  exportIntervalMillis: 2000, // Export interval in milliseconds
}));

const meter = meterProvider.getMeter('example-meter');

// Create a metric
const requestCount = meter.createCounter('requests', {
  description: 'Count all incoming requests',
});

// Function to simulate incoming requests
function simulateRequest() {
  requestCount.add(1, { service: 'example-service' });
}

// Simulate incoming requests every second
setInterval(simulateRequest, 1000);

module.exports = meter;

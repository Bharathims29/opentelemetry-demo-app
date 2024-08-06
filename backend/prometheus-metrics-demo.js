// metrics.js
const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

// Configure Prometheus metrics
const exporter = new PrometheusExporter({ startServer: true }, () => {
  console.log('Prometheus scrape endpoint: http://localhost:9464/metrics');
});

const meter = new MeterProvider({
  exporter,
  interval: 2000,
}).getMeter('prometheus-metrics');

// Example metric
const requestCount = meter.createCounter('requests', {
  description: 'Count all incoming requests',
});

// Function to simulate incoming requests
function simulateRequest() {
  requestCount.add(1, { service: 'prometheus-metrics' });
}

// Simulate incoming requests every second
setInterval(simulateRequest, 1000);

// Export the metric for use in other modules
module.exports = { requestCount };

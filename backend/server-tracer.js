const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// Enable diagnostic logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);

// Configure the tracer
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'backend-service',
  }),
});

// Configure the OTLP exporter
const otlpExporter = new CollectorTraceExporter({
  url: 'grpc://localhost:4317', // Replace with your OpenTelemetry Collector gRPC endpoint
});
const spanProcessor = new BatchSpanProcessor(otlpExporter);
provider.addSpanProcessor(spanProcessor);

// Register the provider
provider.register();

// Get a tracer
const tracer = provider.getTracer('backend-tracer');

module.exports = { tracer, provider };

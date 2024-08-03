const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const cron = require('node-cron');
const { fork } = require('child_process');

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

// Create Express app
const app = express();
const port = 3004;

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Simple in-memory cache
const cache = {};

// Function to trace resource allocation
function traceResourceAllocation(span) {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  span.setAttribute('resource.memory.rss', memoryUsage.rss);
  span.setAttribute('resource.memory.heapTotal', memoryUsage.heapTotal);
  span.setAttribute('resource.memory.heapUsed', memoryUsage.heapUsed);
  span.setAttribute('resource.memory.external', memoryUsage.external);

  span.setAttribute('resource.cpu.user', cpuUsage.user);
  span.setAttribute('resource.cpu.system', cpuUsage.system);
}

// Function to fork a child process and trace it
function forkProcess() {
  const span = tracer.startSpan('fork_process');
  const child = fork('./child.js'); // Replace with your actual child process script

  child.on('message', (message) => {
    span.addEvent('child_message', { message });
  });

  child.on('exit', (code) => {
    span.setAttribute('exit_code', code);
    traceResourceAllocation(span);
    span.end();
  });

  traceResourceAllocation(span);
  return child;
}

// Function to trace cache access
function traceCacheAccess(operation, key, hit) {
  const span = tracer.startSpan(`cache_${operation}`);
  span.setAttribute('cache.key', key);
  span.setAttribute('cache.hit', hit);
  traceResourceAllocation(span);
  span.end();
}

// Middleware to handle requests
app.get('/', (req, res) => {
  const span = tracer.startSpan('handling_request');
  traceResourceAllocation(span);
  res.send('Hello, world!');
  span.end();
});

// Cache endpoints
app.get('/cache/:key', (req, res) => {
  const key = req.params.key;
  if (cache[key]) {
    traceCacheAccess('read', key, true);
    res.status(200).send(cache[key]);
  } else {
    traceCacheAccess('read', key, false);
    res.status(404).send('Cache miss');
  }
});

app.post('/cache/:key', (req, res) => {
  const key = req.params.key;
  cache[key] = req.body.value;
  traceCacheAccess('write', key, true);
  res.status(200).send('Cache updated');
});

// Endpoint to receive traces from the frontend
app.post('/traces', (req, res) => {
  const { name, attributes } = req.body;
  const span = tracer.startSpan(name, {
    attributes,
  });
  traceResourceAllocation(span);
  span.end();
  res.status(200).send('Trace received');
});

// Schedule a background job to run every minute
cron.schedule('* * * * *', () => {
  const jobSpan = tracer.startSpan('background_job');
  try {
    console.log('Running a background job...');
    // Simulate background job work
    setTimeout(() => {
      console.log('Background job completed.');
      traceResourceAllocation(jobSpan);
      jobSpan.end();
    }, 1000);
  } catch (error) {
    jobSpan.recordException(error);
    jobSpan.end();
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  const shutdownSpan = tracer.startSpan('service_shutdown');
  traceResourceAllocation(shutdownSpan);
  provider.shutdown().then(() => {
    console.log('Tracing data flushed and shutdown complete.');
    shutdownSpan.end();
    process.exit(0);
  }).catch(err => {
    console.error('Error shutting down provider:', err);
    shutdownSpan.recordException(err);
    shutdownSpan.end();
    process.exit(1);
  });
});

// Start the server and trace resource allocation
const startSpan = tracer.startSpan('service_startup');
traceResourceAllocation(startSpan);
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  startSpan.end();
});

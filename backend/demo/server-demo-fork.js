const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
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

app.get('/', (req, res) => {
  const span = tracer.startSpan('handling_request');
  res.send('Hello, world!');
  span.end();
});

// Endpoint to receive traces from the frontend
app.post('/traces', (req, res) => {
  const { name, attributes } = req.body;
  const span = tracer.startSpan(name, {
    attributes,
  });
  span.end();
  res.status(200).send('Trace received');
});

// Fork a new process and trace it
app.post('/fork', (req, res) => {
  const forkSpan = tracer.startSpan('fork_process');
  try {
    const child = fork('./child.js');

    child.on('message', (message) => {
      console.log('Message from child:', message);
    });

    child.on('exit', (code) => {
      console.log('Child process exited with code:', code);
      forkSpan.end(); // End span when the child process exits
    });

    res.status(200).send('Fork process started');
  } catch (error) {
    forkSpan.recordException(error);
    forkSpan.end();
    res.status(500).send('Error starting fork process');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  provider.shutdown().then(() => {
    console.log('Tracing data flushed and shutdown complete.');
    process.exit(0);
  }).catch(err => {
    console.error('Error shutting down provider:', err);
    process.exit(1);
  });
});

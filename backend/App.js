const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { tracer, provider } = require('./server-tracer');
const { traceResourceAllocation } = require('./resourceTracing');
const { getCache, setCache } = require('./cache');
const { forkProcess } = require('./forkProcess');
const { simulatedOperation } = require('./errorHandling');
require('./backgroundJob'); // Import to schedule the background job

// Create Express app
const app = express();
const port = 3004;

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

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
  const result = getCache(key);
  res.status(result.status).send(result.value);
});

app.post('/cache/:key', (req, res) => {
  const key = req.params.key;
  const result = setCache(key, req.body.value);
  res.status(result.status).send(result.value);
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

// Fork a process and trace it
forkProcess();

// Run the simulated operation with error handling
simulatedOperation();

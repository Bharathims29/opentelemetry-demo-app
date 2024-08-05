const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { tracer, provider } = require('./server-tracer');
const cacheRouter = require('./cache');
const { simulateErrorHandling } = require('./errorHandling');
const { simulateFork } = require('./forkProcess');
const { simulateBackgroundJob } = require('./backgroundJob');
const { initializeApp } = require('./initialization');
const { traceProcessLifecycle } = require('./lifecycle');
const { traceResourceAllocation } = require('./resourceTracing');
const traceResponseTime = require('./responseTime');

// Initialize the application
initializeApp();

// Create Express app
const app = express();
const port = 3004;


// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Apply middleware for tracing response times
app.use(traceResponseTime);


// Route to handle root
app.get('/', (req, res) => {
  const span = tracer.startSpan('handling_request');
  res.send('Hello, world!');
  span.end();
});

// Endpoint to receive traces from the frontend
app.post('/traces', (req, res) => {
  const { name, attributes } = req.body;
  const span = tracer.startSpan(name, { attributes });
  span.end();
  res.status(200).send('Trace received');
});

// Use routers for different functionalities
app.use('/cache', cacheRouter);

// Simulate various operations
simulateErrorHandling();
simulateFork();
simulateBackgroundJob();

// Graceful shutdown
process.on('SIGINT', () => {
  const shutdownSpan = tracer.startSpan('shutdown_sequence');
  shutdownSpan.addEvent('Freeing up resources');
  provider.shutdown().then(() => {
    shutdownSpan.addEvent('Shutdown complete');
    shutdownSpan.end();
    console.log('Tracing data flushed and shutdown complete.');
    process.exit(0);
  }).catch(err => {
    console.error('Error shutting down provider:', err);
    process.exit(1);
  });
});

// Trace process lifecycle events
traceProcessLifecycle();

// Trace resource allocation
traceResourceAllocation();

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

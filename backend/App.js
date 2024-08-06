const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { tracer, provider } = require('./server-tracer');
const cacheRouter = require('./cache');
const { simulateErrorHandling } = require('./errorHandling');
//const { simulateFork } = require('./forkProcess');
const { forkProcess } = require('./forkProcess');
const { simulateBackgroundJob } = require('./backgroundJob');
const { initializeApp } = require('./initialization');
const { traceProcessLifecycle } = require('./lifecycle');
//const { traceResourceAllocation } = require('./resourceTracing');
const { startResourceTracing } = require('./resourceTracing');
const traceResponseTime = require('./responseTime');
//const { requestCount } = require('./prometheus-metrics'); // Import the metrics
//require('./prometheus-metrics'); // Ensure the metrics script is required to start exporting metrics

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
//simulateFork();

// Endpoint to fork a child process and monitor its resource usage
app.post('/fork-process', (req, res) => {
  try {
    const child = forkProcess();
    res.status(200).send('Child process forked and monitored');
  } catch (error) {
    console.error('Error forking child process:', error);
    res.status(500).send('Error forking child process');
  }
});

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
//traceResourceAllocation();
startResourceTracing(); 

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

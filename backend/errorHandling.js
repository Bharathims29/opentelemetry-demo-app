const { tracer } = require('./server-tracer');

// Function to trace error handling
function traceErrorHandling(operation, error, retries = 0, fallback = false) {
  const span = tracer.startSpan(`error_handling_${operation}`);
  span.setAttribute('error.message', error.message);
  span.setAttribute('error.stack', error.stack);
  span.setAttribute('retries', retries);
  span.setAttribute('fallback', fallback);
  span.end();
}

// Simulated function with error handling
async function simulatedOperation() {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // Simulate an operation that might fail
      throw new Error('Simulated error');
    } catch (error) {
      retries += 1;
      traceErrorHandling('simulated_operation', error, retries);

      if (retries >= maxRetries) {
        // Fallback logic
        traceErrorHandling('simulated_operation', error, retries, true);
        console.error('Operation failed after maximum retries. Executing fallback.');
        return;
      }
    }
  }
}

module.exports = { traceErrorHandling, simulatedOperation };

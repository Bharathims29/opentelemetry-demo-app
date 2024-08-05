const { tracer } = require('./server-tracer');

const simulateErrorHandling = () => {
  const span = tracer.startSpan('error_handling');

  try {
    simulatedOperation();
  } catch (error) {
    span.setAttribute('error.message', error.message);
    span.setAttribute('error.stack', error.stack);
    span.setAttribute('retries', 1);
    span.setAttribute('fallback', false);
  } finally {
    span.end();
  }
};

const simulatedOperation = () => {
  throw new Error('Simulated error');
};

module.exports = { simulateErrorHandling };

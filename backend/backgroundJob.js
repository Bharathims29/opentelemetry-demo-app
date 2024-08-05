const { tracer } = require('./server-tracer');

const simulateBackgroundJob = () => {
  const span = tracer.startSpan('background_job_execution');

  setTimeout(() => {
    span.addEvent('Background job started');
    // Simulate job processing
    setTimeout(() => {
      span.addEvent('Background job completed');
      span.end();
    }, 1000);
  }, 500);
};

module.exports = { simulateBackgroundJob };

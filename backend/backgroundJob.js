const cron = require('node-cron');
const { tracer } = require('./server-tracer');
const { traceResourceAllocation } = require('./resourceTracing');

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

const { fork } = require('child_process');
const { tracer } = require('./server-tracer');
const { traceResourceAllocation, monitorChildProcess } = require('./resourceTracing');

// Function to fork a child process and trace it
function forkProcess() {
  const span = tracer.startSpan('fork_process');
  const child = fork('./child.js'); // Replace with your actual child process script

  child.on('message', (message) => {
    span.addEvent('child_message', { message });
  });

  child.on('exit', (code) => {
    span.setAttribute('exit_code', code);
    traceResourceAllocation(span); // Capture resource usage when the process exits
    span.end();
  });

  child.on('error', (err) => {
    console.error('Error in child process:', err);
    span.recordException(err);
    span.end();
  });

  // Start monitoring the child process
  monitorChildProcess(child);

  traceResourceAllocation(span); // Capture resource usage when the process starts
  return child;
}

module.exports = { forkProcess };

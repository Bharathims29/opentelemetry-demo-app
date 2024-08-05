const { tracer } = require('./server-tracer');

const childSpan = tracer.startSpan('child_process_work');

const simulateChildWork = () => {
  // Simulate some work in the child process
  setTimeout(() => {
    process.send('Child process started work');
    childSpan.addEvent('Started work');
  }, 500);

  setTimeout(() => {
    childSpan.addEvent('Work in progress');
    process.send('Child process in progress');
  }, 1000);

  setTimeout(() => {
    childSpan.addEvent('Work completed');
    process.send('Child process completed work');
    childSpan.end();
    process.exit(0);
  }, 1500);
};

// Start simulating work
simulateChildWork();

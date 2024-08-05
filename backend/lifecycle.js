const { tracer } = require('./server-tracer');

const traceProcessLifecycle = () => {
  const startSpan = tracer.startSpan('process_start');
  startSpan.addEvent('Process started');
  startSpan.end();

  process.on('SIGINT', () => {
    const shutdownSpan = tracer.startSpan('process_shutdown');
    shutdownSpan.addEvent('Process shutting down');
    shutdownSpan.end();
    process.exit(0);
  });

  process.on('SIGHUP', () => {
    const restartSpan = tracer.startSpan('process_restart');
    restartSpan.addEvent('Process restarting');
    restartSpan.end();
    process.exit(0);
  });
};

traceProcessLifecycle();

module.exports = { traceProcessLifecycle };

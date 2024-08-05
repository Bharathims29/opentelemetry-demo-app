const { tracer } = require('./server-tracer');

function traceProcessLifecycle() {
  const lifecycleSpan = tracer.startSpan('process_lifecycle');

  process.on('SIGINT', () => {
    lifecycleSpan.addEvent('Process received SIGINT');
    lifecycleSpan.end();
    process.exit();
  });

  process.on('exit', (code) => {
    const exitSpan = tracer.startSpan('process_exit', { parent: lifecycleSpan.spanContext() });
    exitSpan.addEvent(`Process exited with code ${code}`);
    exitSpan.end();
  });
}

module.exports = { traceProcessLifecycle };

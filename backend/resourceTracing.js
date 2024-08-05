const { tracer } = require('./server-tracer');

function traceResourceAllocation() {
  const resourceSpan = tracer.startSpan('resource_allocation');

  resourceSpan.addEvent('Allocating CPU');
  setTimeout(() => {
    resourceSpan.addEvent('Allocating memory');
    setTimeout(() => {
      resourceSpan.addEvent('Allocating network resources');
      setTimeout(() => {
        resourceSpan.end();
      }, 1000);
    }, 1000);
  }, 1000);

  process.on('exit', (code) => {
    const cleanupSpan = tracer.startSpan('resource_cleanup', { parent: resourceSpan.spanContext() });
    cleanupSpan.addEvent('Freeing CPU');
    cleanupSpan.addEvent('Freeing memory');
    cleanupSpan.addEvent('Freeing network resources');
    cleanupSpan.end();
  });
}

module.exports = { traceResourceAllocation };

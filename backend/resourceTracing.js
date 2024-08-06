const { tracer } = require('./server-tracer'); // Adjust the import based on your file structure

function getResourceUsage() {
  return {
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  };
}

function traceResourceAllocation(span) {
  const usage = getResourceUsage();

  span.setAttribute('resource.memory.rss', usage.memory.rss);
  span.setAttribute('resource.memory.heapTotal', usage.memory.heapTotal);
  span.setAttribute('resource.memory.heapUsed', usage.memory.heapUsed);
  span.setAttribute('resource.memory.external', usage.memory.external);

  span.setAttribute('resource.cpu.user', usage.cpu.user);
  span.setAttribute('resource.cpu.system', usage.cpu.system);
}

function startResourceTracing() {
  const resourceSpan = tracer.startSpan('resource_allocation');

  traceResourceAllocation(resourceSpan);

  setTimeout(() => {
    resourceSpan.addEvent('Resource allocation in progress');
    setTimeout(() => {
      resourceSpan.addEvent('Resource allocation completed');
      traceResourceAllocation(resourceSpan);
      resourceSpan.end();
    }, 1000);
  }, 1000);

  process.on('exit', (code) => {
    const cleanupSpan = tracer.startSpan('resource_cleanup', { parent: resourceSpan.spanContext() });
    cleanupSpan.addEvent('Resource cleanup in progress');
    traceResourceAllocation(cleanupSpan);
    cleanupSpan.end();
  });
}

module.exports = { startResourceTracing };

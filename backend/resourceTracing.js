// Function to trace resource allocation
function traceResourceAllocation(span) {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
  
    span.setAttribute('resource.memory.rss', memoryUsage.rss);
    span.setAttribute('resource.memory.heapTotal', memoryUsage.heapTotal);
    span.setAttribute('resource.memory.heapUsed', memoryUsage.heapUsed);
    span.setAttribute('resource.memory.external', memoryUsage.external);
  
    span.setAttribute('resource.cpu.user', cpuUsage.user);
    span.setAttribute('resource.cpu.system', cpuUsage.system);
  }
  
  module.exports = { traceResourceAllocation };
  
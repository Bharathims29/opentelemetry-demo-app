const { tracer } = require('./server-tracer');

// Initialization sequence tracing
const initSpan = tracer.startSpan('initialization_sequence');
initSpan.addEvent('Configuration loading');
initSpan.addEvent('Connecting to database');
// Simulate a delay for initialization
setTimeout(() => {
  initSpan.addEvent('Dependency injection');
  initSpan.end();
}, 3000);

module.exports = { initSpan };

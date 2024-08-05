const { tracer } = require('./server-tracer');

// Simulated initialization sequence
const initializeApp = () => {
  const initSpan = tracer.startSpan('initialization_sequence');
  initSpan.addEvent('Start initialization');

  setTimeout(() => {
    initSpan.addEvent('Configuration loading');
  }, 500);

  setTimeout(() => {
    initSpan.addEvent('Connecting to database');
  }, 1000);

  setTimeout(() => {
    initSpan.addEvent('Connecting to message broker');
  }, 1500);

  setTimeout(() => {
    initSpan.addEvent('Dependency injection');
  }, 2000);

  setTimeout(() => {
    initSpan.addEvent('Initialization complete');
    initSpan.end();
  }, 2500);
};


module.exports = { initializeApp };

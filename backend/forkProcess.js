const { fork } = require('child_process');
const { tracer } = require('./server-tracer');

const simulateFork = () => {
  const span = tracer.startSpan('fork_process');
  const child = fork('./child.js'); // Assuming child.js exists and does some work

  child.on('message', (message) => {
    span.addEvent(`Child process message: ${message}`);
  });

  child.on('exit', (code) => {
    span.addEvent(`Child process exited with code ${code}`);
    span.end();
  });
};

module.exports = { simulateFork };

// Example child process script
process.send('Child process started');
setTimeout(() => {
  process.send('Child process completed');
  process.exit(0);
}, 2000);

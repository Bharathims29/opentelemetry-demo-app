// Example child process script
try {
  if (process.send) {
    process.send('Child process started');
    setTimeout(() => {
      process.send('Child process completed');
      process.exit(0);
    }, 2000);
  } else {
    console.error('No IPC channel available');
    process.exit(1);
  }
} catch (err) {
  console.error('Error sending message from child process:', err);
  process.exit(1);
}

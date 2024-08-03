import React, { useEffect } from 'react';
import './App.css';
import { tracer } from './tracing';

function App() {
  useEffect(() => {
    const span = tracer.startSpan('load_application-admin');
    span.setAttribute('custom_attribute', 'custom_value');
    span.end();

    // Send the trace to the backend
    fetch('http://localhost:3004/traces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'frontend_load_app',
        attributes: {
          'frontend': 'true',
          'custom_attribute': 'custom_value',
        },
      }),
    })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error sending trace to backend:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;


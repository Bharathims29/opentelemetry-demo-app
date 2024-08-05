// responseTime.js
const { tracer } = require('./server-tracer');

function traceResponseTime(req, res, next) {
  const span = tracer.startSpan('http_request', {
    attributes: {
      'http.method': req.method,
      'http.url': req.originalUrl,
    },
  });

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    span.setAttribute('http.status_code', res.statusCode);
    span.setAttribute('http.response_time_ms', duration);
    span.end();
  });

  next();
}

module.exports = traceResponseTime;

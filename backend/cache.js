const express = require('express');
const { tracer } = require('./server-tracer');
const router = express.Router();

router.get('/read', (req, res) => {
  const span = tracer.startSpan('cache_read');
  const cacheHit = Math.random() > 0.5;

  span.setAttribute('cache.hit', cacheHit);
  if (cacheHit) {
    span.addEvent('Cache hit');
  } else {
    span.addEvent('Cache miss');
  }

  span.end();
  res.send(`Cache read: ${cacheHit ? 'hit' : 'miss'}`);
});

router.post('/write', (req, res) => {
  const span = tracer.startSpan('cache_write');
  span.addEvent('Cache write operation');
  span.end();
  res.send('Cache write: success');
});

module.exports = router;

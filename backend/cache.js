const { tracer } = require('./server-tracer');
const { traceResourceAllocation } = require('./resourceTracing');

// Simple in-memory cache
const cache = {};

// Function to trace cache access
function traceCacheAccess(operation, key, hit) {
  const span = tracer.startSpan(`cache_${operation}`);
  span.setAttribute('cache.key', key);
  span.setAttribute('cache.hit', hit);
  traceResourceAllocation(span);
  span.end();
}

function getCache(key) {
  if (cache[key]) {
    traceCacheAccess('read', key, true);
    return { status: 200, value: cache[key] };
  } else {
    traceCacheAccess('read', key, false);
    return { status: 404, value: 'Cache miss' };
  }
}

function setCache(key, value) {
  cache[key] = value;
  traceCacheAccess('write', key, true);
  return { status: 200, value: 'Cache updated' };
}

module.exports = { getCache, setCache };

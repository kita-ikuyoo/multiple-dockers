const keys = require('./keys');
const Redis = require('ioredis');

// Main client (commands)
const redisClient = new Redis({
  host: keys.redisHost,
  port: keys.redisPort,
  // roughly similar to retry_strategy: () => 1000
  retryStrategy: () => 1000,
});

// Separate connection for Pub/Sub (required in Redis clients)
const sub = new Redis({
  host: keys.redisHost,
  port: keys.redisPort,
  retryStrategy: () => 1000,
});

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

sub.on('message', async (channel, message) => {
  const n = parseInt(message, 10);
  await redisClient.hset('values', message, fib(n));
});

sub.subscribe('insert');

// Optional: basic error logging
redisClient.on('error', (err) => console.error('redisClient error:', err));
sub.on('error', (err) => console.error('sub error:', err));

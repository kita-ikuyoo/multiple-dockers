const keys = require('./keys');
const Redis = require('ioredis');
const isProd = process.env.NODE_ENV === 'production';
// Connect to the Redis Cluster.
// AWS ElastiCache Cluster Mode usually provides a Configuration Endpoint.
// We pass that endpoint here as the initial node.

const redisClient = new Redis.Cluster(
  [{ host: keys.redisHost, port: keys.redisPort }],
  {
    dnsLookup: (address, callback) => callback(null, address),
    redisOptions: isProd ? { tls: {} } : {},
  }
);

// Create a duplicate connection for the subscriber.
// In ioredis, duplicate() works for Cluster instances as well.
const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

sub.on('message', (channel, message) => {
  // ioredis supports the same hset signature (key, field, value)
  console.log("Testtesttesttest")
  redisClient.hset('values', message, fib(parseInt(message)));
});

sub.subscribe('insert');
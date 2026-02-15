const keys = require('./keys');
const Redis = require('ioredis');
// Connect to the Redis Cluster.
// AWS ElastiCache Cluster Mode usually provides a Configuration Endpoint.
// We pass that endpoint here as the initial node.

const redisClient = new Redis.Cluster(
  [{ host: keys.redisHost, port: keys.redisPort }],
  {
    dnsLookup: (address, callback) => callback(null, address),
    redisOptions:  { tls: {} },
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

sub.subscribe("insert", (err, count) => {
  if (err) {
    // Just like other commands, subscribe() can fail for some reasons,
    // ex network issues.
    console.error("Failed to subscribe: %s", err.message);
  } else {
    // `count` represents the number of channels this client are currently subscribed to.
    console.log(
      `Subscribed successfully! This client is currently subscribed to ${count} channels.`
    );
  }
});
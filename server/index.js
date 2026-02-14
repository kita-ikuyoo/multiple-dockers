const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
  ssl:
    process.env.NODE_ENV !== 'production'
      ? false
      : { rejectUnauthorized: false },
});

pgClient.on('connect', (client) => {
  client
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.error(err));
});

// Redis (ioredis) Setup
const Redis = require('ioredis');

const isProd = process.env.NODE_ENV === 'production';
const redisPort = Number(keys.redisPort);

// --- Option A: Redis Cluster (e.g., AWS ElastiCache cluster mode enabled) ---
const redisClient = new Redis.Cluster(
  [{ host: keys.redisHost, port: redisPort }],
  {
    dnsLookup: (address, callback) => callback(null, address),
    redisOptions: isProd ? { tls: {} } : {},
  }
);

// --- Option B: Single-node Redis (uncomment if you are NOT using cluster) ---
// const redisClient = new Redis({
//   host: keys.redisHost,
//   port: redisPort,
//   ...(isProd ? { tls: {} } : {}),
// });

const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  try {
    // You are writing with HSET, so read with HGETALL
    const values = await redisClient.hgetall('values');
    console.log(values)
    res.send(values);
  } catch (err) {
    console.error(err);
    res.status(500).send('Redis error');
  }
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index, 10) > 40) {
    return res.status(422).send('Index too high');
  }

  try {
    // Keep write/publish/db insert consistent and await them
    await redisClient.hset('values', index, 'Nothing yet!');
    await redisPublisher.publish('insert', String(index));
    console.log(index)
    await pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(5000, () => {
  console.log('Listening');
});

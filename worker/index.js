const keys = require('./keys');
const Redis = require('ioredis');

const isProd = process.env.NODE_ENV === 'production';
const redisPort = Number(keys.redisPort);

// ElastiCache cluster mode enabled なら、clustercfg... を startup node にするのが一般的
const startupNodes = [{ host: keys.redisHost, port: redisPort }];

// “書き込み/計算結果を書き戻す” 用クライアント
const redisClient = new Redis.Cluster(startupNodes, {
  dnsLookup: (address, cb) => cb(null, address),
  scaleReads: 'master',
  redisOptions: isProd ? { tls: {} } : {},
});

// “購読” 用クライアント（別接続にする）
const sub = new Redis.Cluster(startupNodes, {
  dnsLookup: (address, cb) => cb(null, address),
  scaleReads: 'master',
  redisOptions: isProd ? { tls: {} } : {},
});

// ---- 最低限のログ（これで原因が一発で分かる）----
redisClient.on('connect', () => console.log('[worker] redisClient connect'));
redisClient.on('ready', () => console.log('[worker] redisClient ready'));
redisClient.on('error', (e) => console.error('[worker] redisClient error', e));

sub.on('connect', () => console.log('[worker] sub connect'));
sub.on('ready', () => console.log('[worker] sub ready'));
sub.on('error', (e) => console.error('[worker] sub error', e));
sub.on('subscribe', (channel, count) =>
  console.log('[worker] subscribed:', channel, 'count=', count)
);

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

sub.on('message', async (channel, message) => {
  console.log('[worker] message:', { channel, message });

  const n = parseInt(message, 10);
  if (Number.isNaN(n)) return;

  const result = fib(n);

  // 重要：cluster でも HSET はOK（ハッシュは1キーなので同じスロットに行く）
  const hsetRes = await redisClient.hset('values', message, String(result));
  console.log('[worker] HSET values', message, '->', result, 'hsetRes=', hsetRes);
});

// subscribe は await して、失敗が見えるようにする
(async () => {
  console.log('[worker] ping:', await redisClient.ping());
  await sub.subscribe('insert');
})();

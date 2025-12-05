const redis = require('redis');
require('dotenv').config();

let client;

const getRedisClient = async () => {
  if (client) return client;

  const url = process.env.REDIS_URL;
  if (!url || url.includes('PASSWORD@HOST:PORT')) {
    console.warn('⚠️ REDIS_URL not set correctly, caching disabled');
    return null;
  }

  client = redis.createClient({ url });

  client.on('error', (err) => {
    console.error('Redis Client Error', err);
  });

  await client.connect();
  console.log('✅ Redis connected');
  return client;
};

module.exports = { getRedisClient };

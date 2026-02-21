import Redis from 'ioredis';

const redisUri = process.env.REDIS_URI || 'redis://127.0.0.1:6379';

export const redis = new Redis(redisUri);

export async function clearSettingsCache() {
    await redis.del('bot:settings');
}

import Redis from 'ioredis';
import dotenv from 'dotenv';
import { Settings } from '../models/Settings';

dotenv.config();

const redisUri = process.env.REDIS_URI || 'redis://127.0.0.1:6379';

export const redis = new Redis(redisUri);

redis.on('connect', () => {
    console.log('Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

// ── Caching Helpers ─────────────────────────────────────
const SETTINGS_CACHE_KEY = 'bot:settings';

/**
 * Gets settings from Redis cache or DB if not cached.
 */
export async function getCachedSettings() {
    try {
        const cached = await redis.get(SETTINGS_CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }

        // Fetch from DB
        const settings = await Settings.findOne();
        if (settings) {
            // Cache for 10 minutes
            await redis.set(SETTINGS_CACHE_KEY, JSON.stringify(settings), 'EX', 600);
            return settings.toObject ? settings.toObject() : settings;
        }
        return null;
    } catch (error) {
        console.error('Error in getCachedSettings:', error);
        return Settings.findOne(); // Fallback to direct DB
    }
}

/**
 * Clears settings cache (should be called from admin actions).
 */
export async function clearSettingsCache() {
    await redis.del(SETTINGS_CACHE_KEY);
}

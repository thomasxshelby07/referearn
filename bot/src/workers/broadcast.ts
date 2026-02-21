import { Worker, Job } from 'bullmq';
import { bot } from '../index';
import IORedis from 'ioredis';
import { User } from '../models/User';

const redisUrl = process.env.REDIS_URI || 'redis://127.0.0.1:6379';
export const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export const broadcastWorker = new Worker('tg-broadcast', async (job: Job) => {
    const { telegramId, text, imageUrl, buttonText, buttonUrl } = job.data;

    // Build optional inline keyboard
    const reply_markup = (buttonText && buttonUrl)
        ? { inline_keyboard: [[{ text: buttonText, url: buttonUrl }]] }
        : undefined;

    try {
        if (imageUrl) {
            await bot.sendPhoto(telegramId, imageUrl, {
                caption: text,
                ...(reply_markup ? { reply_markup } : {})
            });
        } else {
            await bot.sendMessage(telegramId, text, {
                ...(reply_markup ? { reply_markup } : {})
            });
        }
    } catch (error: any) {
        console.error(`Failed to send to ${telegramId}:`, error.message);
        // Handle blocked users
        if (error.response?.statusCode === 403 || error.message.includes('blocked by the user')) {
            await User.findOneAndUpdate({ telegramId }, { isBlocked: true });
        }
    }
}, {
    connection: connection as any,
    limiter: {
        max: 20,
        duration: 1000 // Max 20 messages per second (Telegram limits to 30/s)
    }
});

broadcastWorker.on('completed', job => {
    console.log(`Broadcast Job ${job.id} completed.`);
});

broadcastWorker.on('failed', (job, err) => {
    console.error(`Broadcast Job ${job?.id} failed:`, err.message);
});

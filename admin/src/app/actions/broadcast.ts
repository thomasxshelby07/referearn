'use server';

import { Queue } from 'bullmq';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { revalidatePath } from 'next/cache';
import IORedis from 'ioredis';

export async function BroadcastQueue(formData: FormData) {
    const text = formData.get('text') as string;
    const imageUrl = formData.get('imageUrl') as string | null;

    const redisUrl = process.env.REDIS_URI || 'redis://127.0.0.1:6379';
    const broadcastQueue = new Queue('tg-broadcast', { connection: new IORedis(redisUrl, { maxRetriesPerRequest: null }) as any });

    await connectDB();

    // Find all unblocked active users
    const users = await User.find({ isBlocked: false }).select('telegramId');

    const jobs = users.map(u => ({
        name: 'send-message',
        data: { telegramId: u.telegramId, text, imageUrl }
    }));

    const chunkSize = 1000;
    for (let i = 0; i < jobs.length; i += chunkSize) {
        await broadcastQueue.addBulk(jobs.slice(i, i + chunkSize));
    }

    await broadcastQueue.close();
    revalidatePath('/broadcast');
}

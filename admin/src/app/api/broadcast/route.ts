import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import IORedis from 'ioredis';

export const dynamic = 'force-dynamic';

const LIMIT_PRESETS = [10, 15, 20, 50, 100, 200, 500, 1000, 2000, 2500, 3000, 3500, 4000, 5000];

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const text = formData.get('text') as string;
        const imageUrl = formData.get('imageUrl') as string | null;
        const limitStr = formData.get('limit') as string | null;
        const buttonText = formData.get('buttonText') as string | null;
        const buttonUrl = formData.get('buttonUrl') as string | null;

        if (!text) {
            return NextResponse.json({ message: '❌ Message text is required.' }, { status: 400 });
        }

        await connectDB();

        const redisUrl = process.env.REDIS_URI || 'redis://127.0.0.1:6379';
        const broadcastQueue = new Queue('tg-broadcast', {
            connection: new IORedis(redisUrl, { maxRetriesPerRequest: null }) as any
        });

        const query: any = { isBlocked: false };
        let users;

        if (!limitStr || limitStr === 'all') {
            users = await User.find(query).select('telegramId').sort({ joinedAt: -1 });
        } else {
            const limit = parseInt(limitStr, 10);
            if (!LIMIT_PRESETS.includes(limit)) {
                return NextResponse.json({ message: '❌ Invalid limit value.' }, { status: 400 });
            }
            users = await User.find(query).select('telegramId').sort({ joinedAt: -1 }).limit(limit);
        }

        const jobs = users.map((u: any) => ({
            name: 'send-message',
            data: {
                telegramId: u.telegramId,
                text,
                imageUrl: imageUrl || undefined,
                buttonText: buttonText || undefined,
                buttonUrl: buttonUrl || undefined,
            }
        }));

        const chunkSize = 1000;
        for (let i = 0; i < jobs.length; i += chunkSize) {
            await broadcastQueue.addBulk(jobs.slice(i, i + chunkSize));
        }

        // Close the connection to avoid leaking
        await broadcastQueue.close();

        return NextResponse.json({ message: `✅ Queued for ${users.length} users!` });
    } catch (err) {
        console.error('Broadcast error:', err);
        return NextResponse.json({ message: '❌ Failed to queue broadcast.' }, { status: 500 });
    }
}

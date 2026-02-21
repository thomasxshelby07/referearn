'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db';
import { Task } from '@/lib/models';

export async function createTask(formData: FormData) {
    await connectDB();

    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const url_or_id = formData.get('url_or_id') as string;
    const reward = Number(formData.get('reward'));

    let channelId = undefined;
    let url = url_or_id;

    if (type === 'join_channel') {
        channelId = url_or_id;
        url = `https://t.me/${url_or_id.replace('@', '')}`;
    }

    await Task.create({
        title,
        type,
        url,
        channelId,
        reward,
        isActive: true
    });

    revalidatePath('/tasks');
}

export async function toggleTask(id: string, newStatus: boolean) {
    await connectDB();
    await Task.findByIdAndUpdate(id, { isActive: newStatus });
    revalidatePath('/tasks');
}

export async function deleteTask(id: string) {
    await connectDB();
    await Task.findByIdAndDelete(id);
    revalidatePath('/tasks');
}

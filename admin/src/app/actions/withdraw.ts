'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db';
import { User, Withdrawal, ActivityLog } from '@/lib/models';

const sendTelegramMessage = async (chatId: string, text: string, parse_mode?: string) => {
    const token = process.env.BOT_TOKEN;
    if (!token) return;
    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, ...(parse_mode ? { parse_mode } : {}) })
        });
    } catch (e) {
        console.error('Failed to send TG message via Action:', e);
    }
};

export async function approveWithdrawal(id: string, userId: string, amount: number) {
    await connectDB();

    const w = await Withdrawal.findByIdAndUpdate(id, {
        status: 'approved',
        paidAt: new Date()
    }, { new: true });

    if (!w) return;

    // Deduct balance — totalEarned is lifetime and never reduced
    await User.findOneAndUpdate(
        { telegramId: userId },
        { $inc: { balance: -amount } }
    );

    // Activity Log
    await ActivityLog.create({
        type: 'withdraw',
        userId,
        amount,
        metadata: `withdrew ₹${amount}`
    });

    // Rich Telegram notification
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    await sendTelegramMessage(userId,
        `🎉 Aapka Withdraw Successfully Done!\n\n` +
        `💰 Amount: ₹${amount}\n` +
        `📅 Date: ${dateStr}\n` +
        `💳 UPI: ${w.upi}\n\n` +
        `Paisa aapke UPI mein kuch hi der mein aa jaayega. Thank you! 🙏`
    );

    revalidatePath('/withdrawals');
}

export async function rejectWithdrawal(id: string) {
    await connectDB();

    const w = await Withdrawal.findByIdAndUpdate(id, { status: 'rejected' });

    if (w && w.userId) {
        await sendTelegramMessage(w.userId,
            `❌ Your withdrawal of ₹${w.amount} was rejected. Please contact support.`
        );
    }

    revalidatePath('/withdrawals');
}

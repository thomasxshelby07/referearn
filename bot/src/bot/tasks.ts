import TelegramBot from 'node-telegram-bot-api';
import { Task, CompletedTask } from '../models/Task';
import { User } from '../models/User';
import { Referral } from '../models/Referral';
import { ActivityLog } from '../models/ActivityLog';
import { Settings } from '../models/Settings';

export const handleTaskVerification = async (bot: TelegramBot, telegramId: string, taskId: string) => {
    try {
        const task = await Task.findById(taskId);
        if (!task || !task.isActive) return bot.sendMessage(telegramId, 'Task is no longer active.');

        const user = await User.findOne({ telegramId });
        if (!user) return;

        // Check if already completed
        const existing = await CompletedTask.findOne({ userId: telegramId, taskId: task._id });
        if (existing) return bot.sendMessage(telegramId, 'You have already completed this task!');

        let isVerified = false;

        if (task.type === 'join_channel' && task.channelId) {
            try {
                const chatMember = await bot.getChatMember(task.channelId, Number(telegramId));
                if (['member', 'administrator', 'creator'].includes(chatMember.status)) {
                    isVerified = true;
                }
            } catch (err) {
                console.error('Error verifying channel membership:', err);
                return bot.sendMessage(telegramId, 'Could not verify membership. Make sure you joined the channel.');
            }
        } else if (task.type === 'visit_link' || task.type === 'sponsor_link') {
            isVerified = true;
        }

        if (isVerified) {
            // Give reward
            user.balance += task.reward;
            user.totalEarned += task.reward;
            await user.save();

            await CompletedTask.create({ userId: telegramId, taskId: task._id });

            // Activity Log
            await ActivityLog.create({
                type: 'task',
                userId: telegramId,
                amount: task.reward,
                metadata: `completed a task`
            });

            bot.sendMessage(telegramId, `✅ Task completed! You earned ₹${task.reward}`);

            // First Task Bonus Logic
            const completedCount = await CompletedTask.countDocuments({ userId: telegramId });
            if (completedCount === 1) {
                const firstTaskBonus = 5;
                user.balance += firstTaskBonus;
                user.totalEarned += firstTaskBonus;
                await user.save();
                bot.sendMessage(telegramId, `🎉 First Task Bonus! You earned an extra ₹${firstTaskBonus}`);
            }
        } else {
            bot.sendMessage(telegramId, '❌ Verification failed. Please complete the task criteria.');
        }

    } catch (err) {
        console.error('Error in task verification:', err);
        bot.sendMessage(telegramId, 'An error occurred while verifying the task.');
    }
};

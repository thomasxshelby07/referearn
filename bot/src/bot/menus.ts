import TelegramBot from 'node-telegram-bot-api';
import { ISettings } from '../models/Settings';

// Dynamic menu – reads from settings to determine which buttons to show + their custom labels
export const getMainMenuOptions = async (settings: ISettings | null): Promise<TelegramBot.SendMessageOptions> => {
    const row1: TelegramBot.KeyboardButton[] = [];
    const row2: TelegramBot.KeyboardButton[] = [];
    const row3: TelegramBot.KeyboardButton[] = [];
    const row4: TelegramBot.KeyboardButton[] = [];

    const l = (field: string | undefined, fallback: string) => field?.trim() || fallback;

    if (!settings || settings.tasksEnabled !== false) row1.push({ text: l(settings?.tasksLabel, '🎯 Tasks') });
    if (!settings || settings.walletEnabled !== false) row1.push({ text: l(settings?.walletLabel, '💰 Wallet') });
    if (!settings || settings.earnMoreEnabled !== false) row2.push({ text: l(settings?.earnMoreLabel, '🎁 Earn More') });
    if (!settings || settings.activityEnabled !== false) row2.push({ text: l(settings?.activityLabel, '📡 Activity') });
    if (!settings || settings.withdrawEnabled !== false) row3.push({ text: l(settings?.withdrawLabel, '🏧 Withdraw') });
    if (!settings || settings.dailyBonusEnabled !== false) row3.push({ text: l(settings?.dailyBonusLabel, '🎁 Daily Bonus') });
    if (!settings || settings.vipEnabled !== false) row4.push({ text: l(settings?.vipLabel, '🌟 VIP Channel') });

    const keyboard = [row1, row2, row3, row4].filter(row => row.length > 0);

    return {
        reply_markup: {
            keyboard,
            resize_keyboard: true,
            is_persistent: true
        }
    };
};

export const getInlineMenu = (type: string): TelegramBot.SendMessageOptions => {
    switch (type) {
        case 'wallet':
            return {
                reply_markup: {
                    inline_keyboard: [[{ text: '🏧 Withdraw', callback_data: 'withdraw_start' }]]
                }
            };
        case 'withdraw_confirm':
            return {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '✅ Confirm', callback_data: 'withdraw_confirm_yes' }],
                        [{ text: '❌ Cancel', callback_data: 'withdraw_confirm_no' }]
                    ]
                }
            };
        default:
            return {};
    }
};

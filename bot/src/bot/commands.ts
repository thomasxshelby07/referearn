import TelegramBot from 'node-telegram-bot-api';
import { User } from '../models/User';
import { Referral } from '../models/Referral';
import { Settings } from '../models/Settings';
import { Withdrawal } from '../models/Withdrawal';
import { getMainMenuOptions } from './menus';
import { redis, getCachedSettings } from '../config/redis';
import { Task } from '../models/Task';
import { ActivityLog } from '../models/ActivityLog';

// ── Caching Keys ─────────────────────────────────────
const USER_EXISTS_KEY = (id: string) => `user:exists:${id}`;

// ─────────────────────────────────────────────
// ACTIVITY GENERATOR – Full Name Pool (~200)
// ─────────────────────────────────────────────
const NAME_POOL = [
    'Rahul', 'Aman', 'Pooja', 'Priya', 'Karan', 'Simran', 'Riya', 'Sachin', 'Neha', 'Arjun',
    'Vikas', 'Anjali', 'Mohit', 'Rohit', 'Kavya', 'Nisha', 'Ajay', 'Suman', 'Deepak', 'Komal',
    'Abhishek', 'Meena', 'Varun', 'Tanya', 'Vivek', 'Payal', 'Manish', 'Aarti', 'Shubham', 'Sonam',
    'Aditya', 'Sneha', 'Gaurav', 'Muskan', 'Harsh', 'Diksha', 'Yash', 'Pankaj', 'Nitin', 'Seema',
    'Rakesh', 'Jyoti', 'Tarun', 'Nikita', 'Kapil', 'Bhavna', 'Rajat', 'Swati', 'Ayush', 'Ritu',
    'Ankit', 'Alok', 'Chandan', 'Hemant', 'Lalit', 'Pradeep', 'Mukesh', 'Vinod', 'Naresh', 'Dinesh',
    'Akash', 'Kunal', 'Tushar', 'Mayank', 'Saurabh', 'Shivam', 'Anurag', 'Nikhil', 'Parth', 'Yuvraj',
    'Khushi', 'Priti', 'Radhika', 'Divya', 'Garima', 'Sakshi', 'Isha', 'Mansi', 'Palak', 'Tanvi',
    'Rohan', 'Dev', 'Aryan', 'Krish', 'Samar', 'Keshav', 'Raghav', 'Lakshay', 'Ujjwal', 'Shaurya',
    'Preeti', 'Heena', 'Reema', 'Shreya', 'Trisha', 'Kanika', 'Rupal', 'Bharti', 'Kiran', 'Madhu',
    'Jatin', 'Suraj', 'Harish', 'Mahesh', 'Brijesh', 'Jagdish', 'Omkar', 'Shankar', 'Ganesh', 'Farhan',
    'Ayaan', 'Zaid', 'Sameer', 'Faizan', 'Imran', 'Salman', 'Arif', 'Irfan', 'Sohail', 'Ayesha',
    'Sana', 'Alina', 'Hina', 'Zoya', 'Fiza', 'Mahira', 'Saba', 'Nagma', 'Rukhsar', 'Roshan',
    'Tejas', 'Darshan', 'Pranav', 'Chinmay', 'Om', 'Vedant', 'Atharv', 'Tanay', 'Naman', 'Kriti',
    'Myra', 'Avni', 'Anaya', 'Kiara', 'Ira', 'Vanya', 'Meher', 'Ruhi', 'Aadhya', 'Bharat',
    'Kartik', 'Chetan', 'Jitesh', 'Rituraj', 'Nandkishor', 'Gopal', 'Govind', 'Madhav', 'Mohan', 'Kamla',
    'Lata', 'Savita', 'Sunita', 'Geeta', 'Rekha', 'Poonam', 'Kusum', 'Sarita', 'Shanta', 'Prince',
    'Lucky', 'Rocky', 'Monty', 'Bunty', 'Sonu', 'Monu', 'Bablu', 'Guddu', 'Chintu', 'Sweety',
    'Pinky', 'Tinku', 'Dolly', 'Honey', 'Bunny', 'Mini', 'Rani', 'Pari', 'Chhavi', 'Devansh',
    'Reyansh', 'Vihaan', 'Abeer', 'Kabir', 'Aarav', 'Advik', 'Ishaan', 'Vivaan', 'Kiaan', 'Saanvi',
    'Anvi', 'Veda', 'Prisha', 'Aarohi', 'Navya', 'Siya', 'Mysha', 'Inaya', 'Samaira'
];

const WITHDRAW_AMOUNTS = [
    1000, 1005, 1010, 1015, 1020, 1025, 1030, 1035, 1040, 1045,
    1050, 1055, 1060, 1065, 1070, 1075, 1080, 1085, 1090, 1095,
    1100, 1105, 1110, 1115, 1120, 1125, 1130, 1135, 1140, 1145,
    1150, 1155, 1160, 1165, 1170, 1175, 1180, 1185, 1190, 1195,
    1200, 1205, 1210, 1215, 1220, 1225, 1230, 1235, 1240, 1245, 1250
];

const INVITE_COUNTS = [1, 2, 3, 4, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 20, 21];

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickUniqueNames(count: number, exclude: string[] = []): string[] {
    const pool = NAME_POOL.filter(n => !exclude.includes(n));
    return shuffle(pool).slice(0, count);
}

function makeFakeLog(name: string, type: 'withdraw' | 'invite'): string {
    if (type === 'withdraw') {
        return `💳 <b>${name}</b> just withdrew ₹${pickRandom(WITHDRAW_AMOUNTS)}`;
    } else {
        return `👥 <b>${name}</b> invited ${pickRandom(INVITE_COUNTS)} people today`;
    }
}

// ─────────────────────────────────────────────
// REDIS STATE MACHINE HELPERS (for withdraw flow)
// ─────────────────────────────────────────────
const WITHDRAW_STATE_KEY = (id: string) => `withdraw:state:${id}`;
const WITHDRAW_DATA_KEY = (id: string) => `withdraw:data:${id}`;

// ─────────────────────────────────────────────
// SETUP COMMANDS
// ─────────────────────────────────────────────
export const setupCommands = (bot: TelegramBot) => {

    // ── /start ──────────────────────────────
    bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const telegramId = chatId.toString();
        const firstName = msg.from?.first_name || '';
        const startPayload = match ? match[1] : null;

        try {
            // Check Redis cache for user existence first
            const userExists = await redis.get(USER_EXISTS_KEY(telegramId));
            let user;

            if (!userExists) {
                user = await User.findOne({ telegramId });
                if (!user) {
                    let referrerId = undefined;

                    if (startPayload?.startsWith('ref_')) {
                        const refId = startPayload.replace('ref_', '');
                        if (refId !== telegramId) {
                            const [referrer, settings] = await Promise.all([
                                User.findOne({ telegramId: refId }),
                                getCachedSettings()
                            ]);

                            if (referrer) {
                                referrerId = referrer.telegramId;
                                const refReward = settings?.referralRewardAmount || 0;
                                if (refReward > 0) {
                                    referrer.balance += refReward;
                                    referrer.totalEarned += refReward;
                                    await referrer.save();
                                    bot.sendMessage(referrer.telegramId, `🎉 Someone joined using your invite link! You earned ₹${refReward}`).catch(console.error);
                                }
                                await Referral.create({ userId: referrerId, invitedId: telegramId, status: 'confirmed' });
                            }
                        }
                    }
                    user = await User.create({ telegramId, name: firstName, referrerId, balance: 0, totalEarned: 0 });
                }
                // Cache user existence in Redis for 24 hours
                await redis.set(USER_EXISTS_KEY(telegramId), '1', 'EX', 86400);
            } else {
                // User exists in cache, but we might need to update name occasionally
                // For performance, we skip DB update if it's just a normal start
                // and use a background task or throttle it if needed.
            }

            const settings = await getCachedSettings();
            const welcomeText = settings?.welcomeMessageText || 'Welcome!';
            const menuOptions = await getMainMenuOptions(settings);

            if (settings?.welcomeMessageMediaUrl) {
                await bot.sendPhoto(chatId, settings.welcomeMessageMediaUrl, { caption: welcomeText, ...menuOptions });
            } else {
                await bot.sendMessage(chatId, welcomeText, menuOptions);
            }

        } catch (error) {
            console.error('Error in /start command:', error);
            bot.sendMessage(chatId, 'An error occurred. Please try again.');
        }
    });

    // ── Inline Button Callbacks ──────────────
    bot.on('callback_query', async (query) => {
        const telegramId = query.from.id.toString();
        const chatId = query.message?.chat.id;
        const data = query.data || '';

        await bot.answerCallbackQuery(query.id);

        if (!chatId) return;

        // Withdraw initiation
        if (data === 'withdraw_start') {
            // Block if already has a pending request
            const existing = await Withdrawal.findOne({ userId: telegramId, status: 'pending' });
            if (existing) {
                await bot.sendMessage(chatId,
                    `✅ <b>Your payment request is already received!</b>\n\nYou will receive ₹${existing.amount} within <b>24 hours</b>.\nPlease be patient. 🙏`,
                    { parse_mode: 'HTML' }
                );
                return;
            }
            await redis.set(WITHDRAW_STATE_KEY(telegramId), 'awaiting_name', 'EX', 600);
            await redis.del(WITHDRAW_DATA_KEY(telegramId));
            await bot.sendMessage(chatId,
                '🏧 <b>Withdraw Request</b>\n\nPlease enter your <b>full name</b>:',
                { parse_mode: 'HTML' }
            );
            return;
        }

        // Task callbacks
        if (data.startsWith('task_')) {
            const taskId = data.replace('task_', '');
            const task = await Task.findById(taskId);
            if (task) {
                await bot.sendMessage(chatId,
                    `📌 <b>${task.title}</b>\n\nReward: ₹${task.reward}\n\n👉 <a href="${task.url}">Click here to complete the task</a>\n\nAfter completing, click verify below.`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [[{ text: '✅ I have completed this task', callback_data: `verify_${taskId}` }]]
                        }
                    }
                );
            }
            return;
        }

        // VIP verification
        if (data === 'verify_vip') {
            const [user, settings] = await Promise.all([
                User.findOne({ telegramId }),
                getCachedSettings()
            ]);
            if (!user) return;

            if (user.hasClaimedVipReward) {
                await bot.sendMessage(chatId, '❌ <b>You have already claimed your VIP reward!</b>', { parse_mode: 'HTML' });
                return;
            }

            const channelId = settings?.vipChannelId;

            if (!channelId) {
                await bot.sendMessage(chatId, '❌ VIP Channel is not configured yet.');
                return;
            }

            try {
                const member = await bot.getChatMember(channelId, parseInt(telegramId));
                const allowed = ['member', 'administrator', 'creator'];
                if (allowed.includes(member.status)) {
                    // Reward user
                    const reward = settings?.vipRewardAmount || 100;
                    user.balance += reward;
                    user.totalEarned += reward;
                    user.hasClaimedVipReward = true;
                    await user.save();

                    // Log activity
                    await ActivityLog.create({
                        type: 'task',
                        userId: telegramId,
                        amount: reward,
                        metadata: 'VIP Channel Join'
                    });

                    await bot.sendMessage(chatId, `🎉 <b>Congratulations!</b>\n\nYou joined the VIP channel and earned <b>₹${reward}</b>!\nYour balance: <b>₹${user.balance}</b>`, { parse_mode: 'HTML' });
                } else {
                    await bot.sendMessage(chatId, '❌ <b>You haven\'t joined the VIP channel yet!</b>\n\nPlease join and then click verify.', { parse_mode: 'HTML' });
                }
            } catch (error) {
                console.error('Error verifying VIP join:', error);
                await bot.sendMessage(chatId, '❌ <b>Error verifying membership.</b>\nMake sure the bot is an admin in the channel and you have joined.', { parse_mode: 'HTML' });
            }
            return;
        }
    });

    // ── General Messages (keyboard + withdraw flow) ──
    bot.on('message', async (msg) => {
        if (!msg.text || msg.text.startsWith('/')) return;
        const telegramId = msg.chat.id.toString();
        const text = msg.text.trim();

        // ── Withdraw Conversation State Machine ──
        const wState = await redis.get(WITHDRAW_STATE_KEY(telegramId));

        if (wState === 'awaiting_name') {
            await redis.hset(WITHDRAW_DATA_KEY(telegramId), 'name', text);
            await redis.set(WITHDRAW_STATE_KEY(telegramId), 'awaiting_upi', 'EX', 600);
            await bot.sendMessage(msg.chat.id,
                '✅ Name saved!\n\n💳 Now enter your <b>UPI ID</b> (e.g. yourname@upi):',
                { parse_mode: 'HTML' }
            );
            return;
        }

        if (wState === 'awaiting_upi') {
            await redis.hset(WITHDRAW_DATA_KEY(telegramId), 'upi', text);
            await redis.set(WITHDRAW_STATE_KEY(telegramId), 'awaiting_phone', 'EX', 600);
            await bot.sendMessage(msg.chat.id,
                '✅ UPI ID saved!\n\n📞 Now enter your <b>Phone Number</b>:',
                { parse_mode: 'HTML' }
            );
            return;
        }

        if (wState === 'awaiting_phone') {
            const [data, user] = await Promise.all([
                redis.hgetall(WITHDRAW_DATA_KEY(telegramId)),
                User.findOne({ telegramId })
            ]);

            if (!user) {
                await redis.del(WITHDRAW_STATE_KEY(telegramId));
                await redis.del(WITHDRAW_DATA_KEY(telegramId));
                return;
            }

            // Save withdrawal request
            await Withdrawal.create({
                userId: telegramId,
                name: data.name || 'Unknown',
                upi: data.upi || '',
                phone: text,
                email: '',
                amount: user.balance,
                status: 'pending'
            });

            // Clear conversation state
            await Promise.all([
                redis.del(WITHDRAW_STATE_KEY(telegramId)),
                redis.del(WITHDRAW_DATA_KEY(telegramId))
            ]);

            await bot.sendMessage(msg.chat.id,
                `🎉 <b>Withdraw Request Submitted!</b>\n\n` +
                `<b>Name:</b> ${data.name}\n` +
                `<b>UPI ID:</b> ${data.upi}\n` +
                `<b>Phone:</b> ${text}\n` +
                `<b>Amount:</b> ₹${user.balance}\n\n` +
                `✅ Your withdrawal will be processed <b>within 24 hours</b>.\n` +
                `Thank you for your patience! 🙏`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        // ── Regular Keyboard Buttons ──
        const settings = await getCachedSettings();
        if (!settings) return;

        const is = (label: string | undefined, fallback: string) => text === (label?.trim() || fallback);

        if (is(settings.tasksLabel, '🎯 Tasks')) {
            if (!settings.tasksEnabled) { await bot.sendMessage(msg.chat.id, '🎯 Tasks are currently disabled.'); return; }
            const activeTasks = await Task.find({ isActive: true });
            if (activeTasks.length === 0) {
                await bot.sendMessage(msg.chat.id, 'No tasks available right now.');
            } else {
                const keyboard = activeTasks.map(task => ([{ text: `✅ ${task.title} (₹${task.reward})`, callback_data: `task_${task._id}` }]));
                await bot.sendMessage(msg.chat.id, 'Here are the available tasks:', { reply_markup: { inline_keyboard: keyboard } });
            }
            return;
        }

        if (is(settings.walletLabel, '💰 Wallet')) {
            if (!settings.walletEnabled) { await bot.sendMessage(msg.chat.id, '💰 Wallet is currently disabled.'); return; }
            await handleWallet(bot, telegramId, settings);
            return;
        }

        if (is(settings.withdrawLabel, '🏧 Withdraw')) {
            if (!settings.withdrawEnabled) { await bot.sendMessage(msg.chat.id, '🏧 Withdrawals are currently disabled.'); return; }
            await handleWithdrawMenu(bot, telegramId, settings);
            return;
        }

        if (is(settings.activityLabel, '📡 Activity')) {
            if (!settings.activityEnabled) { await bot.sendMessage(msg.chat.id, '📡 Activity is currently disabled.'); return; }
            await handleFakeActivity(bot, telegramId);
            return;
        }

        if (is(settings.earnMoreLabel, '🎁 Earn More')) {
            if (!settings.earnMoreEnabled) { await bot.sendMessage(msg.chat.id, '🎁 Earn More is currently disabled.'); return; }
            await handleEarnMore(bot, telegramId, settings);
            return;
        }

        if (is(settings.dailyBonusLabel, '🎁 Daily Bonus')) {
            if (!settings.dailyBonusEnabled) { await bot.sendMessage(msg.chat.id, '🎁 Daily Bonus is currently disabled.'); return; }
            await handleDailyBonus(bot, telegramId, settings);
            return;
        }

        if (is(settings.vipLabel, '🌟 VIP Channel')) {
            if (!settings.vipEnabled) { await bot.sendMessage(msg.chat.id, '🌟 VIP Channel is currently disabled.'); return; }
            await handleVipChannel(bot, telegramId, settings);
            return;
        }
    });
};

// ─────────────────────────────────────────────
// WALLET (with image)
// ─────────────────────────────────────────────
const handleWallet = async (bot: TelegramBot, telegramId: string, settings: any) => {
    const [user, paidWithdrawals] = await Promise.all([
        User.findOne({ telegramId }),
        Withdrawal.find({ userId: telegramId, status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
    ]);

    if (!user) return bot.sendMessage(telegramId, 'User not found.');

    let historyText = '';
    if (paidWithdrawals.length > 0) {
        historyText = '\n\n📜 <b>Paid Withdrawals:</b>\n';
        for (const w of paidWithdrawals as any[]) {
            const date = new Date(w.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            historyText += `  ✅ ₹${w.amount} — ${date}\n`;
        }
    }

    const caption =
        `${settings.walletMessageText || '💰 Wallet'}\n\n` +
        `<b>Balance:</b> ₹${user.balance}\n` +
        `<b>Total Earned:</b> ₹${user.totalEarned}` +
        historyText;

    if (settings.walletMessageMediaUrl) {
        await bot.sendPhoto(telegramId, settings.walletMessageMediaUrl, { caption, parse_mode: 'HTML' });
    } else {
        await bot.sendMessage(telegramId, caption, { parse_mode: 'HTML' });
    }
};

// ─────────────────────────────────────────────
// WITHDRAW MENU (with inline button when eligible)
// ─────────────────────────────────────────────
const handleWithdrawMenu = async (bot: TelegramBot, telegramId: string, settings: any) => {
    const [user, existing] = await Promise.all([
        User.findOne({ telegramId }),
        Withdrawal.findOne({ userId: telegramId, status: 'pending' })
    ]);

    if (!user) return bot.sendMessage(telegramId, 'User not found.');

    // If already has a pending request — show status instead
    if (existing) {
        await bot.sendMessage(telegramId,
            `✅ <b>Your payment request is already received!</b>\n\nAmount: <b>₹${existing.amount}</b>\n\nYou will receive your amount within <b>24 hours</b>. Please be patient. 🙏`,
            { parse_mode: 'HTML' }
        );
        return;
    }

    const minWithdraw = settings.minimumWithdraw || 1000;
    const headerText = settings.withdrawMessageText || '🏧 Withdraw your earnings:';
    const isEligible = user.balance >= minWithdraw;
    const bodyText = isEligible
        ? `\n\n✅ <b>You are eligible to withdraw!</b>\nYour balance: <b>₹${user.balance}</b>`
        : `\n\n❌ Minimum withdraw ₹${minWithdraw} required\nYour balance: ₹${user.balance}\nEarn ₹${minWithdraw - user.balance} more to unlock.`;
    const fullText = headerText + bodyText;
    const replyMarkup = isEligible
        ? { reply_markup: { inline_keyboard: [[{ text: '💸 Withdraw Now', callback_data: 'withdraw_start' }]] } }
        : {};

    if (settings.withdrawMessageMediaUrl) {
        await bot.sendPhoto(telegramId, settings.withdrawMessageMediaUrl, { caption: fullText, parse_mode: 'HTML', ...replyMarkup });
    } else {
        await bot.sendMessage(telegramId, fullText, { parse_mode: 'HTML', ...replyMarkup });
    }
};

// ─────────────────────────────────────────────
// DAILY BONUS
// ─────────────────────────────────────────────
const handleDailyBonus = async (bot: TelegramBot, telegramId: string, settings: any) => {
    // Get current date in IST (Asia/Kolkata)
    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
    const formatter = new Intl.DateTimeFormat('en-IN', options);
    const parts = formatter.formatToParts(new Date());
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const istDate = `${year}-${month}-${day}`;

    const claimKey = `bonus:claimed:${telegramId}:${istDate}`;

    const alreadyClaimed = await redis.get(claimKey);
    if (alreadyClaimed) {
        await bot.sendMessage(telegramId, '⏳ You have already claimed your daily bonus today. Come back after 12:00 AM (IST) tomorrow!');
        return;
    }

    const user = await User.findOne({ telegramId });
    if (!user) return;

    user.balance += settings.dailyBonusAmount || 0;
    user.totalEarned += settings.dailyBonusAmount || 0;
    user.lastBonus = new Date();
    await user.save();

    // Set key for current day, expire in 25 hours to clear Redis
    await redis.set(claimKey, 'claimed', 'EX', 25 * 60 * 60);

    await bot.sendMessage(telegramId, `🎁 <b>Daily Bonus Claimed!</b>\n₹${settings.dailyBonusAmount} added to your wallet\n\nCome back after 12:00 AM (IST) tomorrow! 🌟`, { parse_mode: 'HTML' });
};

// ─────────────────────────────────────────────
// ACTIVITY GENERATOR (Advanced — fresh every click)
// ─────────────────────────────────────────────
const handleFakeActivity = async (bot: TelegramBot, telegramId: string) => {
    const dedupKey = `activity:dedup:${telegramId}`;

    const logsNeeded = Math.floor(Math.random() * 6) + 5; // 5-10
    const realCount = Math.round(logsNeeded * 0.4);
    const fakeCount = logsNeeded - realCount;

    // Real logs from DB - optimized with limit and lean
    const dbLogs = await ActivityLog.find().sort({ createdAt: -1 }).limit(10).lean();
    const realLogs: string[] = shuffle(
        (dbLogs as any[]).map((log: any) => {
            if (log.type === 'withdraw') return `💳 <b>User${String(log.userId).slice(-4)}</b> just withdrew ₹${log.amount}`;
            if (log.type === 'referral') return `👥 <b>User${String(log.userId).slice(-4)}</b> invited someone today`;
            if (log.type === 'task') return `✅ <b>User${String(log.userId).slice(-4)}</b> completed a task and earned ₹${log.amount}`;
            if (log.type === 'bonus') return `🎁 <b>User${String(log.userId).slice(-4)}</b> claimed daily bonus ₹${log.amount}`;
            return null;
        }).filter(Boolean) as string[]
    ).slice(0, realCount);

    // Dedup
    const dedupRaw = await redis.get(dedupKey);
    const recentLogs: string[] = dedupRaw ? JSON.parse(dedupRaw) : [];
    const usedNames: string[] = [];
    const fakeLogs: string[] = [];

    const wCount = Math.floor(Math.random() * (fakeCount + 1));
    const iCount = fakeCount - wCount;
    const types = shuffle([...Array(wCount).fill('withdraw'), ...Array(iCount).fill('invite')]) as ('withdraw' | 'invite')[];

    for (let i = 0; i < fakeCount; i++) {
        const names = pickUniqueNames(1, usedNames);
        if (!names.length) break;
        const name = names[0];
        usedNames.push(name);
        const type = types[i] || 'withdraw';
        let log = makeFakeLog(name, type);

        if (recentLogs.includes(log)) {
            const alts = pickUniqueNames(1, usedNames);
            if (alts.length) {
                const alt = makeFakeLog(alts[0], type);
                if (!recentLogs.includes(alt)) { fakeLogs.push(alt); usedNames.push(alts[0]); continue; }
            }
        }
        fakeLogs.push(log);
    }

    await redis.set(dedupKey, JSON.stringify([...recentLogs, ...fakeLogs].slice(-20)), 'EX', 3600);

    const allLogs = shuffle([...realLogs, ...fakeLogs]);
    const text = `<b>📡 Live Recent Activity</b>\n\n${allLogs.join('\n')}`;
    await bot.sendMessage(telegramId, text, { parse_mode: 'HTML' });
};

// ─────────────────────────────────────────────
// EARN MORE (Referral)
// ─────────────────────────────────────────────
const handleEarnMore = async (bot: TelegramBot, telegramId: string, settings: any) => {
    try {
        const botInfo = await bot.getMe();
        const refLink = `https://t.me/${botInfo.username}?start=ref_${telegramId}`;
        const msgText = `${settings.referralMessageText}\n\n👉 <b>Your Invite Link:</b>\n${refLink}`;
        if (settings.referralMessageMediaUrl) {
            await bot.sendPhoto(telegramId, settings.referralMessageMediaUrl, { caption: msgText, parse_mode: 'HTML' });
        } else {
            await bot.sendMessage(telegramId, msgText, { parse_mode: 'HTML' });
        }
    } catch (error) {
        console.error('Error generating referral link:', error);
        bot.sendMessage(telegramId, 'Error generating your invite link. Please try again.');
    }
};

// ─────────────────────────────────────────────
// VIP CHANNEL
// ─────────────────────────────────────────────
const handleVipChannel = async (bot: TelegramBot, telegramId: string, settings: any) => {
    const user = await User.findOne({ telegramId });
    if (!user) return;

    if (user.hasClaimedVipReward) {
        await bot.sendMessage(telegramId, '✅ <b>You have already claimed your VIP reward!</b>', { parse_mode: 'HTML' });
        return;
    }

    const reward = settings.vipRewardAmount || 100;
    const channelLink = settings.vipChannelLink || '#';
    const text = (settings.vipMessageText || '🌟 Join our VIP Channel to earn ₹100 instantly!') +
        `\n\n💰 <b>Reward:</b> ₹${reward}`;

    const reply_markup = {
        inline_keyboard: [
            [{ text: '📢 Join VIP Channel', url: channelLink }],
            [{ text: '✅ Verify & Claim ₹' + reward, callback_data: 'verify_vip' }]
        ]
    };

    if (settings.vipMessageMediaUrl) {
        await bot.sendPhoto(telegramId, settings.vipMessageMediaUrl, { caption: text, parse_mode: 'HTML', reply_markup });
    } else {
        await bot.sendMessage(telegramId, text, { parse_mode: 'HTML', reply_markup });
    }
};

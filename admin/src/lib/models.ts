import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    telegramId: { type: String, required: true, unique: true },
    name: { type: String },
    referrerId: { type: String },
    balance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    lastBonus: { type: Date },
    isBlocked: { type: Boolean, default: false }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);

const taskSchema = new Schema({
    type: { type: String, required: true, enum: ['join_channel', 'visit_link', 'sponsor_link'] },
    title: { type: String, required: true },
    url: { type: String, required: true },
    reward: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    channelId: { type: String }
});

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

const withdrawalSchema = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    upi: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

export const Withdrawal = mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);

const settingsSchema = new Schema({
    welcomeMessageText: { type: String, default: "Welcome to Cricknowbot! Join tasks to earn money today." },
    welcomeMessageMediaUrl: { type: String },
    dailyBonusAmount: { type: Number, default: 5 },
    minimumWithdraw: { type: Number, default: 1000 },
    referralMessageText: { type: String, default: "Invite your friends and earn money when they complete tasks!" },
    referralMessageMediaUrl: { type: String },
    referralRewardAmount: { type: Number, default: 10 },
    // Button enable flags
    tasksEnabled: { type: Boolean, default: true },
    walletEnabled: { type: Boolean, default: true },
    withdrawEnabled: { type: Boolean, default: true },
    activityEnabled: { type: Boolean, default: true },
    earnMoreEnabled: { type: Boolean, default: true },
    dailyBonusEnabled: { type: Boolean, default: true },
    // Custom button labels
    tasksLabel: { type: String, default: '🎯 Tasks' },
    walletLabel: { type: String, default: '💰 Wallet' },
    withdrawLabel: { type: String, default: '🏧 Withdraw' },
    activityLabel: { type: String, default: '📡 Activity' },
    earnMoreLabel: { type: String, default: '🎁 Earn More' },
    dailyBonusLabel: { type: String, default: '🎁 Daily Bonus' },
    // Wallet response
    walletMessageText: { type: String, default: '💰 Here is your wallet info:' },
    walletMessageMediaUrl: { type: String },
    // Withdraw response
    withdrawMessageText: { type: String, default: '🏧 Withdraw your earnings:' },
    withdrawMessageMediaUrl: { type: String },
});

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

const activityLogSchema = new Schema({
    type: { type: String, enum: ['task', 'referral', 'bonus', 'withdraw'], required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    time: { type: Date, default: Date.now },
    metadata: { type: String }
});

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

// Clear models to fix Next.js HMR schema caching issues
if (process.env.NODE_ENV !== 'production') {
    if (mongoose.models.User) mongoose.deleteModel('User');
    if (mongoose.models.Task) mongoose.deleteModel('Task');
    if (mongoose.models.Withdrawal) mongoose.deleteModel('Withdrawal');
    if (mongoose.models.Settings) mongoose.deleteModel('Settings');
    if (mongoose.models.ActivityLog) mongoose.deleteModel('ActivityLog');
}

import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
    welcomeMessageText: string;
    welcomeMessageMediaUrl?: string;
    dailyBonusAmount: number;
    minimumWithdraw: number;
    referralMessageText: string;
    referralMessageMediaUrl?: string;
    referralRewardAmount: number;
    // Button enable flags
    tasksEnabled: boolean;
    walletEnabled: boolean;
    withdrawEnabled: boolean;
    activityEnabled: boolean;
    earnMoreEnabled: boolean;
    dailyBonusEnabled: boolean;
    // Custom button labels
    tasksLabel: string;
    walletLabel: string;
    withdrawLabel: string;
    activityLabel: string;
    earnMoreLabel: string;
    dailyBonusLabel: string;
    // Wallet message & image
    walletMessageText: string;
    walletMessageMediaUrl?: string;
    // Withdraw message & image
    withdrawMessageText: string;
    withdrawMessageMediaUrl?: string;
}

const settingsSchema = new Schema<ISettings>({
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
    // Wallet message & image
    walletMessageText: { type: String, default: '💰 Here is your wallet info:' },
    walletMessageMediaUrl: { type: String },
    // Withdraw message & image
    withdrawMessageText: { type: String, default: '🏧 Withdraw your earnings:' },
    withdrawMessageMediaUrl: { type: String },
});

export const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema);

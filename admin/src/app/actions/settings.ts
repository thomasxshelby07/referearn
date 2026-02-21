'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db';
import { Settings } from '@/lib/models';

export async function updateSettings(formData: FormData) {
    await connectDB();

    const welcomeMessageText = formData.get('welcomeMessageText') as string;
    const welcomeMessageMediaUrl = formData.get('welcomeMessageMediaUrl') as string | null;
    const dailyBonusAmount = Number(formData.get('dailyBonusAmount'));
    const minimumWithdraw = Number(formData.get('minimumWithdraw'));
    const referralMessageText = formData.get('referralMessageText') as string;
    const referralMessageMediaUrl = formData.get('referralMessageMediaUrl') as string | null;
    const referralRewardAmount = Number(formData.get('referralRewardAmount'));
    const walletMessageText = formData.get('walletMessageText') as string;
    const walletMessageMediaUrl = formData.get('walletMessageMediaUrl') as string | null;
    const withdrawMessageText = formData.get('withdrawMessageText') as string;
    const withdrawMessageMediaUrl = formData.get('withdrawMessageMediaUrl') as string | null;
    const vipChannelLink = formData.get('vipChannelLink') as string;
    const vipChannelId = formData.get('vipChannelId') as string;
    const vipRewardAmount = Number(formData.get('vipRewardAmount'));
    const vipMessageText = formData.get('vipMessageText') as string;
    const vipMessageMediaUrl = formData.get('vipMessageMediaUrl') as string | null;

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    settings.welcomeMessageText = welcomeMessageText;
    if (welcomeMessageMediaUrl) settings.welcomeMessageMediaUrl = welcomeMessageMediaUrl;
    if (dailyBonusAmount) settings.dailyBonusAmount = dailyBonusAmount;
    if (minimumWithdraw) settings.minimumWithdraw = minimumWithdraw;
    settings.referralMessageText = referralMessageText;
    if (referralMessageMediaUrl) settings.referralMessageMediaUrl = referralMessageMediaUrl;
    if (referralRewardAmount) settings.referralRewardAmount = referralRewardAmount;
    if (walletMessageText) settings.walletMessageText = walletMessageText;
    if (walletMessageMediaUrl) settings.walletMessageMediaUrl = walletMessageMediaUrl;
    if (withdrawMessageText) settings.withdrawMessageText = withdrawMessageText;
    if (withdrawMessageMediaUrl) settings.withdrawMessageMediaUrl = withdrawMessageMediaUrl;
    settings.vipChannelLink = vipChannelLink;
    settings.vipChannelId = vipChannelId;
    if (vipRewardAmount) settings.vipRewardAmount = vipRewardAmount;
    settings.vipMessageText = vipMessageText;
    if (vipMessageMediaUrl) settings.vipMessageMediaUrl = vipMessageMediaUrl;

    await settings.save();
    revalidatePath('/settings');
}

export async function updateButtonControls(formData: FormData) {
    await connectDB();

    const g = (key: string) => formData.get(key) as string | null;

    const $set: Record<string, any> = {
        // Toggle flags
        tasksEnabled: g('tasksEnabled') === '1',
        walletEnabled: g('walletEnabled') === '1',
        withdrawEnabled: g('withdrawEnabled') === '1',
        activityEnabled: g('activityEnabled') === '1',
        earnMoreEnabled: g('earnMoreEnabled') === '1',
        dailyBonusEnabled: g('dailyBonusEnabled') === '1',
        vipEnabled: g('vipEnabled') === '1',
    };

    // Custom labels — only set if non-empty
    const labelMap: [string, string][] = [
        ['tasksLabel', g('tasksLabel') || ''],
        ['walletLabel', g('walletLabel') || ''],
        ['withdrawLabel', g('withdrawLabel') || ''],
        ['activityLabel', g('activityLabel') || ''],
        ['earnMoreLabel', g('earnMoreLabel') || ''],
        ['dailyBonusLabel', g('dailyBonusLabel') || ''],
        ['vipLabel', g('vipLabel') || ''],
    ];
    for (const [key, val] of labelMap) {
        if (val.trim()) $set[key] = val.trim();
    }

    await Settings.findOneAndUpdate({}, { $set }, { upsert: true });
    revalidatePath('/button-control');
}

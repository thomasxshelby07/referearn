'use client';

import { useState } from 'react';
import { updateButtonControls } from '@/app/actions/settings';

const BUTTONS = [
    { enabledKey: 'tasksEnabled', labelKey: 'tasksLabel', emoji: '🎯', defaultLabel: '🎯 Tasks' },
    { enabledKey: 'walletEnabled', labelKey: 'walletLabel', emoji: '💰', defaultLabel: '💰 Wallet' },
    { enabledKey: 'earnMoreEnabled', labelKey: 'earnMoreLabel', emoji: '🎁', defaultLabel: '🎁 Earn More' },
    { enabledKey: 'activityEnabled', labelKey: 'activityLabel', emoji: '📡', defaultLabel: '📡 Activity' },
    { enabledKey: 'withdrawEnabled', labelKey: 'withdrawLabel', emoji: '🏧', defaultLabel: '🏧 Withdraw' },
    { enabledKey: 'dailyBonusEnabled', labelKey: 'dailyBonusLabel', emoji: '🎁', defaultLabel: '🎁 Daily Bonus' },
    { enabledKey: 'vipEnabled', labelKey: 'vipLabel', emoji: '🌟', defaultLabel: '🌟 VIP Channel' },
] as const;

type EnabledKey = (typeof BUTTONS)[number]['enabledKey'];
type LabelKey = (typeof BUTTONS)[number]['labelKey'];

export default function ButtonControlForm({ settings }: { settings: any }) {
    const [toggles, setToggles] = useState<Record<EnabledKey, boolean>>({
        tasksEnabled: settings.tasksEnabled ?? true,
        walletEnabled: settings.walletEnabled ?? true,
        earnMoreEnabled: settings.earnMoreEnabled ?? true,
        activityEnabled: settings.activityEnabled ?? true,
        withdrawEnabled: settings.withdrawEnabled ?? true,
        dailyBonusEnabled: settings.dailyBonusEnabled ?? true,
        vipEnabled: settings.vipEnabled ?? true,
    });
    const [labels, setLabels] = useState<Record<LabelKey, string>>({
        tasksLabel: settings.tasksLabel || '🎯 Tasks',
        walletLabel: settings.walletLabel || '💰 Wallet',
        earnMoreLabel: settings.earnMoreLabel || '🎁 Earn More',
        activityLabel: settings.activityLabel || '📡 Activity',
        withdrawLabel: settings.withdrawLabel || '🏧 Withdraw',
        dailyBonusLabel: settings.dailyBonusLabel || '🎁 Daily Bonus',
        vipLabel: settings.vipLabel || '🌟 VIP Channel',
    });
    const [saved, setSaved] = useState(false);

    const toggle = (key: EnabledKey) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
        setSaved(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        for (const [k, v] of Object.entries(toggles)) formData.set(k, v ? '1' : '0');
        for (const [k, v] of Object.entries(labels)) formData.set(k, v);
        await updateButtonControls(formData);
        setSaved(true);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {BUTTONS.map(({ enabledKey, labelKey, emoji, defaultLabel }) => (
                <div
                    key={enabledKey}
                    className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-white transition-all space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{emoji}</span>
                            <div>
                                <p className="font-semibold text-black tracking-wide">{defaultLabel}</p>
                                <p className="text-xs text-neutral-400">
                                    {toggles[enabledKey] ? 'Visible to users' : 'Hidden from users'}
                                </p>
                            </div>
                        </div>
                        {/* Toggle Switch */}
                        <button
                            type="button"
                            onClick={() => toggle(enabledKey)}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${toggles[enabledKey] ? 'bg-black' : 'bg-neutral-300'}`}
                            aria-label={`Toggle ${defaultLabel}`}
                        >
                            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${toggles[enabledKey] ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>
                    {/* Custom Label Input */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-neutral-500 font-semibold tracking-wide whitespace-nowrap">Button Name:</label>
                        <input
                            type="text"
                            value={labels[labelKey]}
                            onChange={e => { setLabels(prev => ({ ...prev, [labelKey]: e.target.value })); setSaved(false); }}
                            className="flex-1 p-2 text-sm bg-white border border-neutral-200 rounded-lg focus:ring-1 focus:ring-black outline-none"
                            placeholder={defaultLabel}
                        />
                    </div>
                </div>
            ))}

            <button
                type="submit"
                className="w-full py-4 mt-4 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all"
            >
                Save Button Settings
            </button>

            {saved && (
                <p className="text-center text-green-600 font-semibold text-sm animate-pulse">
                    ✅ Settings saved! Changes reflect on next /start.
                </p>
            )}
        </form>
    );
}

// Admin Settings Interface (Last Updated: 2026-02-21)
'use client';

import { useState } from 'react';
import { updateSettings } from '@/app/actions/settings';

type UploadField = 'welcome' | 'referral' | 'wallet' | 'withdraw' | 'vip';

export default function SettingsForm({ settings }: { settings: any }) {
    const [images, setImages] = useState({
        welcome: settings.welcomeMessageMediaUrl || '',
        referral: settings.referralMessageMediaUrl || '',
        wallet: settings.walletMessageMediaUrl || '',
        withdraw: settings.withdrawMessageMediaUrl || '',
        vip: settings.vipMessageMediaUrl || '',
    });
    const [uploading, setUploading] = useState<UploadField | null>(null);
    const [statuses, setStatuses] = useState<Record<UploadField, string>>({
        welcome: '', referral: '', wallet: '', withdraw: '', vip: ''
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: UploadField) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(field);
        setStatuses(s => ({ ...s, [field]: 'Uploading to Cloudinary...' }));
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setImages(prev => ({ ...prev, [field]: data.secure_url }));
            setStatuses(s => ({ ...s, [field]: 'Upload successful! Remember to save settings.' }));
        } catch {
            setStatuses(s => ({ ...s, [field]: 'Upload failed. Try again.' }));
        } finally {
            setUploading(null);
        }
    };

    const inputCls = "w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black outline-none transition-all";
    const fileCls = `${inputCls} resize-y file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-neutral-800`;
    const labelCls = "block text-sm font-semibold text-black mb-2 tracking-wide";
    const sectionCls = "border-b border-neutral-200 pb-6 mb-6";

    const ImageField = ({ field, name, label }: { field: UploadField; name: string; label: string }) => (
        <div>
            <label className={labelCls}>{label}</label>
            <input type="file" accept="image/*" onChange={e => handleFileChange(e, field)}
                disabled={uploading !== null} className={fileCls} />
            <input type="hidden" name={name} value={images[field]} />
            {statuses[field] && (
                <p className={`text-sm font-medium mt-2 ${statuses[field].startsWith('Upload s') ? 'text-green-600' : uploading === field ? 'text-neutral-500 animate-pulse' : 'text-red-500'}`}>
                    {statuses[field]}
                </p>
            )}
            {images[field] && (
                <div className="mt-3">
                    <p className="text-sm text-neutral-500 mb-2 font-medium">Current Image Preview:</p>
                    <img src={images[field]} alt={`${field} preview`} className="max-w-full h-auto rounded-xl border border-neutral-200 max-h-48 object-contain" />
                </div>
            )}
        </div>
    );

    return (
        <form action={updateSettings} className="space-y-6">

            {/* ── Welcome Message ── */}
            <div className={sectionCls}>
                <h2 className="text-xl font-bold text-black mb-4 tracking-wide">Welcome Message</h2>
                <div className="space-y-4">
                    <div>
                        <label className={labelCls}>Text to display on /start</label>
                        <textarea name="welcomeMessageText" defaultValue={settings.welcomeMessageText}
                            required rows={4} className={`${inputCls} resize-y`} />
                    </div>
                    <ImageField field="welcome" name="welcomeMessageMediaUrl" label="Welcome Image Upload" />
                </div>
            </div>

            {/* ── Wallet Response ── */}
            <div className={sectionCls}>
                <h2 className="text-xl font-bold text-black mb-4 tracking-wide">💰 Wallet Response</h2>
                <div className="space-y-4">
                    <div>
                        <label className={labelCls}>Wallet Message Text</label>
                        <textarea name="walletMessageText" defaultValue={settings.walletMessageText}
                            rows={3} className={`${inputCls} resize-y`} placeholder="💰 Here is your wallet info:" />
                    </div>
                    <ImageField field="wallet" name="walletMessageMediaUrl" label="Wallet Image Upload (Optional)" />
                </div>
            </div>

            {/* ── Withdraw Response ── */}
            <div className={sectionCls}>
                <h2 className="text-xl font-bold text-black mb-4 tracking-wide">🏧 Withdraw Response</h2>
                <div className="space-y-4">
                    <div>
                        <label className={labelCls}>Withdraw Message Text</label>
                        <textarea name="withdrawMessageText" defaultValue={settings.withdrawMessageText}
                            rows={3} className={`${inputCls} resize-y`} placeholder="🏧 Withdraw your earnings:" />
                    </div>
                    <ImageField field="withdraw" name="withdrawMessageMediaUrl" label="Withdraw Image Upload (Optional)" />
                </div>
            </div>

            {/* ── Referral Settings ── */}
            <div className={sectionCls}>
                <h2 className="text-xl font-bold text-black mb-4 tracking-wide">Referral Settings (Earn More)</h2>
                <div className="space-y-4">
                    <div>
                        <label className={labelCls}>Text to display on Earn More click</label>
                        <textarea name="referralMessageText" defaultValue={settings.referralMessageText}
                            required rows={4} className={`${inputCls} resize-y`} />
                    </div>
                    <ImageField field="referral" name="referralMessageMediaUrl" label="Referral Image Upload" />
                    <div>
                        <label className={labelCls}>Reward Per Valid Referral (₹)</label>
                        <input type="number" name="referralRewardAmount" defaultValue={settings.referralRewardAmount}
                            required className={inputCls} placeholder="e.g. 10" />
                    </div>
                </div>
            </div>

            {/* ── VIP Channel Settings ── */}
            <div className={sectionCls}>
                <h2 className="text-xl font-bold text-black mb-4 tracking-wide">🌟 VIP Channel Settings</h2>
                <div className="space-y-4">
                    <div>
                        <label className={labelCls}>VIP Message Text (displayed before join link)</label>
                        <textarea name="vipMessageText" defaultValue={settings.vipMessageText}
                            rows={3} className={`${inputCls} resize-y`} placeholder="🌟 Join our VIP Channel to earn ₹100 instantly!" />
                    </div>
                    <ImageField field="vip" name="vipMessageMediaUrl" label="VIP Image Upload (Optional)" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>VIP Channel Link (Public Link)</label>
                            <input type="text" name="vipChannelLink" defaultValue={settings.vipChannelLink}
                                className={inputCls} placeholder="e.g. https://t.me/yourchannel" />
                        </div>
                        <div>
                            <label className={labelCls}>VIP Channel Username/@ (for verification)</label>
                            <input type="text" name="vipChannelId" defaultValue={settings.vipChannelId}
                                className={inputCls} placeholder="e.g. @yourchannel" />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>VIP Reward Amount (₹)</label>
                        <input type="number" name="vipRewardAmount" defaultValue={settings.vipRewardAmount}
                            className={inputCls} placeholder="e.g. 100" />
                    </div>
                </div>
            </div>

            {/* ── Economy Controls ── */}
            <div>
                <h2 className="text-xl font-bold text-black mb-4 tracking-wide">Economy Controls</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Daily Bonus (₹)</label>
                        <input type="number" name="dailyBonusAmount" defaultValue={settings.dailyBonusAmount}
                            required className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Minimum Withdraw (₹)</label>
                        <input type="number" name="minimumWithdraw" defaultValue={settings.minimumWithdraw}
                            required className={inputCls} />
                    </div>
                </div>
            </div>

            <button disabled={uploading !== null} type="submit"
                className="w-full py-4 mt-6 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-sm hover:shadow disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Save Settings'}
            </button>
        </form>
    );
}

'use client';

import { useState } from 'react';

const LIMIT_OPTIONS = [
    { label: 'Latest 10', value: '10' },
    { label: 'Latest 15', value: '15' },
    { label: 'Latest 20', value: '20' },
    { label: 'Latest 50', value: '50' },
    { label: 'Latest 100', value: '100' },
    { label: 'Latest 200', value: '200' },
    { label: 'Latest 500', value: '500' },
    { label: 'Latest 1000', value: '1000' },
    { label: 'Latest 2000', value: '2000' },
    { label: 'Latest 2500', value: '2500' },
    { label: 'Latest 3000', value: '3000' },
    { label: 'Latest 3500', value: '3500' },
    { label: 'Latest 4000', value: '4000' },
    { label: 'Latest 5000', value: '5000' },
    { label: '🌐 All Users', value: 'all' },
];

const inputCls = "w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black outline-none transition-all";
const labelCls = "block text-sm font-semibold text-black mb-2 tracking-wide";

export default function BroadcastPage() {
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [sending, setSending] = useState(false);
    const [sendStatus, setSendStatus] = useState('');
    const [limit, setLimit] = useState('all');
    const [buttonText, setButtonText] = useState('');
    const [buttonUrl, setButtonUrl] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadStatus('Uploading to Cloudinary...');
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setImageUrl(data.secure_url);
            setUploadStatus('✅ Upload successful!');
        } catch {
            setUploadStatus('❌ Upload failed. Try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSending(true);
        setSendStatus('');
        const form = e.currentTarget;
        const fd = new FormData(form);
        fd.set('limit', limit);
        if (imageUrl) fd.set('imageUrl', imageUrl);
        if (buttonText) fd.set('buttonText', buttonText);
        if (buttonUrl) fd.set('buttonUrl', buttonUrl);
        try {
            const res = await fetch('/api/broadcast', { method: 'POST', body: fd });
            const data = await res.json();
            setSendStatus(data.message || '✅ Queued successfully!');
        } catch {
            setSendStatus('❌ Failed to queue broadcast.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-black">Broadcast Messages</h1>
            <p className="text-neutral-500 text-sm mb-8 tracking-wide">
                Send a message to selected users via BullMQ queue (max 20 msgs/sec).
            </p>

            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Recipient Limit */}
                    <div>
                        <label className={labelCls}>Send To</label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {LIMIT_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setLimit(opt.value)}
                                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${limit === opt.value
                                            ? 'bg-black text-white border-black'
                                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-black'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Text */}
                    <div>
                        <label className={labelCls}>Message Text</label>
                        <textarea
                            name="text"
                            required
                            rows={5}
                            className={`${inputCls} resize-y`}
                            placeholder="Enter your broadcast message..."
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className={labelCls}>Broadcast Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className={`${inputCls} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-neutral-800`}
                        />
                        {uploadStatus && (
                            <p className={`text-sm font-medium mt-2 ${uploadStatus.startsWith('✅') ? 'text-green-600' : uploadStatus.startsWith('❌') ? 'text-red-500' : 'text-neutral-500 animate-pulse'}`}>
                                {uploadStatus}
                            </p>
                        )}
                        {imageUrl && (
                            <div className="mt-3">
                                <p className="text-xs text-neutral-400 font-medium mb-1">Preview:</p>
                                <img src={imageUrl} alt="Broadcast preview" className="max-w-full h-auto rounded-xl border border-neutral-200 max-h-48 object-contain" />
                            </div>
                        )}
                    </div>

                    {/* Inline Button */}
                    <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3">
                        <p className={labelCls + " mb-0"}>Inline Button (Optional)</p>
                        <p className="text-xs text-neutral-400 -mt-2">Appears below the message as a clickable button.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-neutral-600 mb-1 block">Button Label</label>
                                <input
                                    type="text"
                                    value={buttonText}
                                    onChange={e => setButtonText(e.target.value)}
                                    className={inputCls}
                                    placeholder="e.g. 🎁 Claim Bonus"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-600 mb-1 block">Button URL</label>
                                <input
                                    type="url"
                                    value={buttonUrl}
                                    onChange={e => setButtonUrl(e.target.value)}
                                    className={inputCls}
                                    placeholder="https://t.me/yourbotname"
                                />
                            </div>
                        </div>
                        {buttonText && buttonUrl && (
                            <div className="text-xs text-neutral-500 bg-white border border-neutral-200 rounded-lg p-2">
                                Preview: <span className="font-bold text-black">[{buttonText}]</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={sending || uploading}
                        className="w-full py-4 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all flex justify-center items-center gap-2 shadow-sm hover:shadow disabled:opacity-50"
                    >
                        {sending ? 'Queuing...' : `Send Broadcast → ${LIMIT_OPTIONS.find(o => o.value === limit)?.label ?? 'All'}`}
                    </button>

                    {sendStatus && (
                        <p className={`text-center font-semibold text-sm ${sendStatus.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
                            {sendStatus}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}

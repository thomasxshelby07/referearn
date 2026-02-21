import connectDB from '@/lib/db';
import { Settings } from '@/lib/models';
import SettingsForm from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    await connectDB();

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-extrabold tracking-tight mb-8 text-black">Bot Settings</h1>

            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60 relative">
                <SettingsForm settings={JSON.parse(JSON.stringify(settings))} />
            </div>
        </div>
    );
}

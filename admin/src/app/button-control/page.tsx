import connectDB from '@/lib/db';
import { Settings } from '@/lib/models';
import ButtonControlForm from '@/components/ButtonControlForm';

export default async function ButtonControlPage() {
    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-black">Button Control</h1>
            <p className="text-neutral-500 text-sm mb-8 tracking-wide">Enable or disable specific buttons from the bot's main keyboard menu.</p>

            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60">
                <ButtonControlForm settings={JSON.parse(JSON.stringify(settings))} />
            </div>
        </div>
    );
}

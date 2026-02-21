import connectDB from '@/lib/db';
import { User } from '@/lib/models';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    await connectDB();
    const users = await User.find({}).sort({ joinedAt: -1 }).limit(200);

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-black">User Management</h1>
            <p className="text-neutral-500 text-sm mb-8 tracking-wide">All registered users, sorted by most recent.</p>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                                <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Name</th>
                                <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Telegram ID</th>
                                <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Balance</th>
                                <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Total Earned</th>
                                <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Joined At</th>
                                <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id.toString()} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                    <td className="p-4 font-semibold text-black">
                                        {(user as any).name || <span className="text-neutral-400 font-normal">—</span>}
                                    </td>
                                    <td className="p-4 font-mono text-sm text-neutral-600">{user.telegramId}</td>
                                    <td className="p-4 text-black font-bold">₹{user.balance}</td>
                                    <td className="p-4 text-neutral-600 font-medium">₹{user.totalEarned}</td>
                                    <td className="p-4 text-neutral-500 text-sm font-medium">
                                        {new Date(user.joinedAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="p-4">
                                        {user.isBlocked ? (
                                            <span className="px-2.5 py-1 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider">Blocked</span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider">Active</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-neutral-500 font-medium tracking-wide">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

import connectDB from '@/lib/db';
import { User, Withdrawal } from '@/lib/models';
import {
    Users,
    UserPlus,
    Activity,
    Wallet,
    Clock,
    ArrowRight,
    Megaphone,
    ListTodo,
    TrendingUp,
    History
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const conn = await connectDB();

    if (!conn) {
        return (
            <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-red-800">
                <h2 className="text-xl font-bold mb-2">⚠️ Database Connection Error</h2>
                <p>Could not connect to MongoDB. The <b>MONGO_URI</b> environment variable is missing in the current <b>{process.env.NODE_ENV}</b> environment.</p>
                <p className="mt-4 text-sm font-semibold italic">Important: If you just added the variable in Vercel settings, you MUST manually trigger a "Redeploy" for it to take effect.</p>
                <p className="mt-2 text-xs opacity-75">Deployment Env: {process.env.VERCEL_ENV || 'local'}</p>
            </div>
        );
    }

    // Fetch data
    const totalUsers = await User.countDocuments({});

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const activeUsers = await User.countDocuments({ lastBonus: { $gte: twentyFourHoursAgo } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayJoins = await User.countDocuments({ joinedAt: { $gte: today } });

    const withdrawals = await Withdrawal.find({ status: 'approved' });
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

    const pendingWithdraws = await Withdrawal.countDocuments({ status: 'pending' });

    const recentUsers = await User.find({}).sort({ joinedAt: -1 }).limit(5);

    // Helpers
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">System Live</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-neutral-900 mb-2">
                        {getGreeting()}, <span className="text-neutral-500">Admin</span>
                    </h1>
                    <p className="text-neutral-500 text-sm font-medium">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/broadcast" className="flex items-center gap-2 bg-neutral-900 text-white hover:bg-black transition-all px-5 py-2.5 rounded-2xl font-bold text-sm shadow-xl shadow-neutral-200">
                        <Megaphone size={18} />
                        New Broadcast
                    </Link>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users Card */}
                <div className="bg-white p-7 rounded-[2rem] border border-neutral-200/50 shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Users size={24} className="stroke-[2.2px]" />
                        </div>
                        <TrendingUp size={16} className="text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-neutral-400 font-bold uppercase tracking-wider mb-1">Total Users</p>
                        <p className="text-4xl font-black text-neutral-900 tracking-tighter tabular-nums">{totalUsers.toLocaleString()}</p>
                    </div>
                </div>

                {/* Today's Joins Card */}
                <div className="bg-white p-7 rounded-[2rem] border border-neutral-200/50 shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50/50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors"></div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <UserPlus size={24} className="stroke-[2.2px]" />
                        </div>
                        <div className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">TODAY</div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-neutral-400 font-bold uppercase tracking-wider mb-1">New Joins</p>
                        <p className="text-4xl font-black text-neutral-900 tracking-tighter tabular-nums">{todayJoins.toLocaleString()}</p>
                    </div>
                </div>

                {/* Active Users Card */}
                <div className="bg-white p-7 rounded-[2rem] border border-neutral-200/50 shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50/50 rounded-full blur-2xl group-hover:bg-purple-100 transition-colors"></div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Activity size={24} className="stroke-[2.2px]" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-purple-600">LIVE</span>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-neutral-400 font-bold uppercase tracking-wider mb-1">Active (24h)</p>
                        <p className="text-4xl font-black text-neutral-900 tracking-tighter tabular-nums">{activeUsers.toLocaleString()}</p>
                    </div>
                </div>

                {/* Total Withdrawn Card */}
                <div className="bg-white p-7 rounded-[2rem] border border-neutral-200/50 shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50/50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors"></div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Wallet size={24} className="stroke-[2.2px]" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-neutral-400 font-bold uppercase tracking-wider mb-1">Total Payouts</p>
                        <p className="text-4xl font-black text-neutral-900 tracking-tighter tabular-nums flex items-baseline gap-1">
                            <span className="text-2xl font-medium text-amber-600">₹</span>{totalWithdrawn.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Users Section */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-neutral-200/50 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white border border-neutral-200 rounded-xl">
                                <History size={20} className="text-neutral-600" />
                            </div>
                            <h2 className="text-xl font-black text-neutral-900 tracking-tight">Recent Onboardings</h2>
                        </div>
                        <Link href="/users" className="text-sm font-bold text-neutral-500 hover:text-black flex items-center gap-1.5 transition-colors">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="p-2 flex-1">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-neutral-400">User Details</th>
                                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-neutral-400">Registration</th>
                                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-neutral-400 text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {recentUsers.map((user) => (
                                        <tr key={user._id} className="group hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center font-bold text-neutral-600 text-sm border-2 border-white shadow-sm">
                                                        {(user.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-neutral-900 truncate max-w-[150px]">{user.name || 'Anonymous'}</p>
                                                        <p className="text-xs text-neutral-400 font-medium tracking-tight">@{user.telegramId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-xs font-bold text-neutral-600">
                                                    {new Date(user.joinedAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-[10px] text-neutral-400 font-medium">
                                                    {new Date(user.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="text-sm font-black text-neutral-900">₹{user.balance?.toFixed(2) || '0.00'}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Pending */}
                <div className="space-y-8">
                    {/* Quick Actions Card */}
                    <div className="bg-neutral-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-neutral-200 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
                        <h2 className="text-xl font-bold mb-6 relative z-10">Quick Actions</h2>
                        <div className="grid gap-4 relative z-10">
                            <Link href="/tasks" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group/btn">
                                <div className="flex items-center gap-3">
                                    <ListTodo size={20} className="text-neutral-400" />
                                    <span className="text-sm font-bold">Manage Tasks</span>
                                </div>
                                <ArrowRight size={16} className="text-neutral-500 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/withdrawals" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group/btn">
                                <div className="flex items-center gap-3">
                                    <Wallet size={20} className="text-neutral-400" />
                                    <span className="text-sm font-bold">Withdrawal Hub</span>
                                </div>
                                <ArrowRight size={16} className="text-neutral-500 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Pending Withdrawals Notification */}
                    {pendingWithdraws > 0 ? (
                        <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100 flex flex-col gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-amber-900">Attention Required</h3>
                                    <p className="text-amber-700/70 text-sm font-bold leading-snug mt-1">
                                        There are {pendingWithdraws} withdrawal requests waiting for your approval.
                                    </p>
                                </div>
                            </div>
                            <Link href="/withdrawals" className="flex items-center justify-center gap-2 bg-amber-900 text-white hover:bg-amber-950 transition-colors py-4 rounded-2xl font-black text-sm shadow-lg shadow-amber-200">
                                Review Payouts
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/50 text-center flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-300">
                                <Clock size={24} />
                            </div>
                            <p className="text-sm font-bold text-neutral-400">All caught up! No pending withdrawals.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

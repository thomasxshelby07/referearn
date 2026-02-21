import connectDB from '@/lib/db';
import { User, Withdrawal } from '@/lib/models';
import { Users, UserPlus, Activity, Wallet, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const conn = await connectDB();

    if (!conn) {
        return (
            <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-red-800">
                <h2 className="text-xl font-bold mb-2">⚠️ Database Connection Error</h2>
                <p>Could not connect to MongoDB. Please check if <b>MONGO_URI</b> is set in your Vercel Environment Variables.</p>
                <p className="mt-4 text-sm opacity-75">Note: If your backend is on Railway, you must still provide the MONGO_URI to the Vercel frontend so it can read the data.</p>
            </div>
        );
    }

    const totalUsers = await User.countDocuments({});

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const activeUsers = await User.countDocuments({ lastBonus: { $gte: twentyFourHoursAgo } }); // Using lastBonus as proxy for active

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayJoins = await User.countDocuments({ joinedAt: { $gte: today } });

    const withdrawals = await Withdrawal.find({ status: 'approved' });
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

    const pendingWithdraws = await Withdrawal.countDocuments({ status: 'pending' });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-black">
                    Dashboard Overview
                </h1>
                <p className="text-neutral-500 text-sm">
                    Monitor your bot's performance, user growth, and financial metrics in real-time.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users Card */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-neutral-300 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-neutral-100 rounded-full blur-2xl opacity-60 group-hover:bg-neutral-200 transition-all"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="p-2.5 bg-black text-white rounded-xl group-hover:scale-110 transition-transform">
                            <Users size={22} className="stroke-[2.5px]" />
                        </div>
                    </div>
                    <div className="relative z-10 mt-2">
                        <p className="text-sm text-neutral-500 font-medium mb-1">Total Users</p>
                        <p className="text-3xl font-bold text-black">{totalUsers.toLocaleString()}</p>
                    </div>
                </div>

                {/* Today's Joins Card */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-neutral-300 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-neutral-100 rounded-full blur-2xl opacity-60 group-hover:bg-neutral-200 transition-all"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="p-2.5 bg-black text-white rounded-xl group-hover:scale-110 transition-transform">
                            <UserPlus size={22} className="stroke-[2.5px]" />
                        </div>
                    </div>
                    <div className="relative z-10 mt-2">
                        <p className="text-sm text-neutral-500 font-medium mb-1">Today's Joins</p>
                        <p className="text-3xl font-bold text-black">{todayJoins.toLocaleString()}</p>
                    </div>
                </div>

                {/* Active Users Card */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-neutral-300 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-neutral-100 rounded-full blur-2xl opacity-60 group-hover:bg-neutral-200 transition-all"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="p-2.5 bg-black text-white rounded-xl group-hover:scale-110 transition-transform">
                            <Activity size={22} className="stroke-[2.5px]" />
                        </div>
                    </div>
                    <div className="relative z-10 mt-2">
                        <p className="text-sm text-neutral-500 font-medium mb-1">Active (24h)</p>
                        <p className="text-3xl font-bold text-black">{activeUsers.toLocaleString()}</p>
                    </div>
                </div>

                {/* Total Withdrawn Card */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-neutral-300 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-neutral-100 rounded-full blur-2xl opacity-60 group-hover:bg-neutral-200 transition-all"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="p-2.5 bg-black text-white rounded-xl group-hover:scale-110 transition-transform">
                            <Wallet size={22} className="stroke-[2.5px]" />
                        </div>
                    </div>
                    <div className="relative z-10 mt-2">
                        <p className="text-sm text-neutral-500 font-medium mb-1">Total Withdrawn</p>
                        <p className="text-3xl font-bold text-black flex items-baseline gap-1">
                            <span className="text-xl font-medium">₹</span>{totalWithdrawn.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Pending Withdrawals Banner */}
            {pendingWithdraws > 0 ? (
                <div className="mt-8 bg-black p-6 sm:p-8 rounded-3xl shadow-lg border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-neutral-800 rounded-xl hidden sm:block">
                            <Clock className="text-white" size={28} />
                        </div>
                        <div className="p-2 bg-neutral-800 rounded-xl sm:hidden">
                            <Clock className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-wide">Action Required</h2>
                            <p className="text-neutral-400 text-sm font-medium">You have {pendingWithdraws} pending withdrawal requests to review.</p>
                        </div>
                    </div>

                    <Link href="/withdrawals" className="shrink-0 flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 transition-colors px-6 py-3 rounded-xl font-bold text-sm w-full sm:w-auto">
                        Review Withdrawals
                        <ArrowRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className="mt-8 bg-white border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8 p-6 rounded-3xl flex items-center justify-center gap-3 text-neutral-500">
                    <Clock size={20} />
                    <p className="font-medium text-sm">No pending withdrawal requests to review at the moment.</p>
                </div>
            )}
        </div>
    );
}

import connectDB from '@/lib/db';
import { Withdrawal } from '@/lib/models';
import { approveWithdrawal, rejectWithdrawal } from '@/app/actions/withdraw';

export default async function WithdrawalsPage() {
    await connectDB();

    const requests = await Withdrawal.find({}).sort({ createdAt: -1 }).limit(100);

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold tracking-tight mb-8 text-black">Withdrawal Requests</h1>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                                <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Telegram ID</th>
                                <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Name / UPI</th>
                                <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Amount</th>
                                <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Date</th>
                                <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Status</th>
                                <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req._id.toString()} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                    <td className="p-4 font-mono text-sm text-neutral-800">{req.userId}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-black">{req.name}</div>
                                        <div className="text-sm font-medium text-neutral-500">{req.upi}</div>
                                    </td>
                                    <td className="p-4 text-black font-semibold">₹{req.amount}</td>
                                    <td className="p-4 text-neutral-500 font-medium text-sm">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        {req.status === 'pending' && <span className="px-2.5 py-1 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider">Pending</span>}
                                        {req.status === 'approved' && <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider">Paid</span>}
                                        {req.status === 'rejected' && <span className="px-2.5 py-1 bg-neutral-100 text-neutral-400 border border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider line-through">Rejected</span>}
                                    </td>
                                    <td className="p-4 space-x-2 flex">
                                        {req.status === 'pending' && (
                                            <>
                                                <form action={approveWithdrawal.bind(null, req._id.toString(), req.userId, req.amount)}>
                                                    <button className="px-4 py-2 bg-black hover:bg-neutral-800 transition-colors text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:shadow">Approve</button>
                                                </form>
                                                <form action={rejectWithdrawal.bind(null, req._id.toString())}>
                                                    <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 transition-colors text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:shadow">Reject</button>
                                                </form>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-neutral-500 font-medium tracking-wide">No withdrawal requests found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

import connectDB from '@/lib/db';
import { Task } from '@/lib/models';
import { createTask, toggleTask, deleteTask } from '@/app/actions/tasks';

export default async function TasksPage() {
    await connectDB();

    const tasks = await Task.find({}).sort({ _id: -1 });

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold tracking-tight mb-8 text-black">Task Manager</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-max">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200">
                                    <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Task Title</th>
                                    <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Type</th>
                                    <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Reward</th>
                                    <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Status</th>
                                    <th className="p-4 font-semibold text-neutral-600 text-sm tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task._id.toString()} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                        <td className="p-4 font-bold text-black">{task.title}</td>
                                        <td className="p-4 text-sm text-neutral-500 font-medium">{task.type}</td>
                                        <td className="p-4 font-bold text-black">₹{task.reward}</td>
                                        <td className="p-4">
                                            {task.isActive ? (
                                                <span className="px-2.5 py-1 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider">Active</span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider">Inactive</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <form action={toggleTask.bind(null, task._id.toString(), !task.isActive)}>
                                                    <button className="text-neutral-500 hover:text-black font-bold text-sm uppercase tracking-wide hover:underline transition-all">
                                                        {task.isActive ? 'Disable' : 'Enable'}
                                                    </button>
                                                </form>
                                                <form action={deleteTask.bind(null, task._id.toString())}>
                                                    <button className="text-red-400 hover:text-red-600 font-bold text-sm uppercase tracking-wide hover:underline transition-all">
                                                        Delete
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {tasks.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-neutral-500 font-medium tracking-wide">No tasks created yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60 h-fit relative">
                    <h2 className="text-xl font-bold text-black mb-6 tracking-wide">Create New Task</h2>
                    <form action={createTask} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-black mb-2 tracking-wide">Task Title</label>
                            <input type="text" name="title" required className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black outline-none transition-all" placeholder="e.g. Join our Main Channel" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-black mb-2 tracking-wide">Task Type</label>
                            <select name="type" className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black outline-none transition-all">
                                <option value="join_channel">Join Telegram Channel</option>
                                <option value="visit_link">Visit Website Link</option>
                                <option value="sponsor_link">Sponsor Link</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-black mb-2 tracking-wide">Channel ID / URL</label>
                            <input type="text" name="url_or_id" required className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black outline-none transition-all" placeholder="@mychannel or https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-black mb-2 tracking-wide">Reward (₹)</label>
                            <input type="number" name="reward" required min="0" step="1" className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black outline-none transition-all" placeholder="5" />
                        </div>
                        <button type="submit" className="w-full py-4 mt-2 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-sm hover:shadow">
                            Create Task
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

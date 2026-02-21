import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
    type: 'join_channel' | 'visit_link' | 'sponsor_link';
    title: string;
    url: string;
    reward: number;
    isActive: boolean;
    channelId?: string; // For join_channel
}

const taskSchema = new Schema<ITask>({
    type: { type: String, required: true, enum: ['join_channel', 'visit_link', 'sponsor_link'] },
    title: { type: String, required: true },
    url: { type: String, required: true },
    reward: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    channelId: { type: String }
});

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);

export interface ICompletedTask extends Document {
    userId: string;
    taskId: mongoose.Types.ObjectId;
    completedAt: Date;
}

const completedTaskSchema = new Schema<ICompletedTask>({
    userId: { type: String, required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    completedAt: { type: Date, default: Date.now }
});

export const CompletedTask = mongoose.models.CompletedTask || mongoose.model<ICompletedTask>('CompletedTask', completedTaskSchema);

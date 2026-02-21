import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
    type: 'task' | 'referral' | 'bonus' | 'withdraw';
    userId: string; // The related user
    amount: number;
    time: Date;
    metadata?: string; // Text to show, e.g., "Aman earned ₹5"
}

const activityLogSchema = new Schema<IActivityLog>({
    type: { type: String, required: true, enum: ['task', 'referral', 'bonus', 'withdraw'] },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    time: { type: Date, default: Date.now },
    metadata: { type: String }
});

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

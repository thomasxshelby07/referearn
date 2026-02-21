import mongoose, { Document, Schema } from 'mongoose';

export interface IWithdrawal extends Document {
    userId: string;
    name: string;
    upi: string;
    phone: string;
    email: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
}

const withdrawalSchema = new Schema<IWithdrawal>({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    upi: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

export const Withdrawal = mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', withdrawalSchema);

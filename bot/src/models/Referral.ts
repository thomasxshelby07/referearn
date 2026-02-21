import mongoose, { Document, Schema } from 'mongoose';

export interface IReferral extends Document {
    userId: string; // The person who invited
    invitedId: string; // The person who was invited
    status: 'pending' | 'confirmed' | 'fake';
    createdAt: Date;
}

const referralSchema = new Schema<IReferral>({
    userId: { type: String, required: true },
    invitedId: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'fake'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

export const Referral = mongoose.models.Referral || mongoose.model<IReferral>('Referral', referralSchema);

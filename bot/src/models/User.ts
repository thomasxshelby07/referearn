import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    telegramId: string;
    name?: string;
    referrerId?: string;
    balance: number;
    totalEarned: number;
    joinedAt: Date;
    lastBonus?: Date;
    isBlocked: boolean;
}

const userSchema = new Schema<IUser>({
    telegramId: { type: String, required: true, unique: true },
    name: { type: String },
    referrerId: { type: String },
    balance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    lastBonus: { type: Date },
    isBlocked: { type: Boolean, default: false }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

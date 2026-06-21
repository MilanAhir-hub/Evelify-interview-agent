import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amount: number; // in paise
    credits: number;
    tierId: string;
    status: 'created' | 'paid' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true, index: true },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    credits: { type: Number, required: true },
    tierId: { type: String, required: true },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created', required: true }
}, { timestamps: true });

PaymentSchema.index({ userId: 1, razorpayOrderId: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

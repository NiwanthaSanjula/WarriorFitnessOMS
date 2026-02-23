import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
    member: mongoose.Types.ObjectId;
    subscription: mongoose.Types.ObjectId;
    plan: mongoose.Types.ObjectId;
    amount: number;
    method: 'cash' | 'online';
    invoinceNo: string;
    recoredBy: mongoose.Types.ObjectId;
    
}

const paymentSchema = new Schema<IPayment>({
    member: { type: Schema.Types.ObjectId, ref: 'User', required:true },
    subscription: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
    plan: { type: Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash' , 'online'] , default: 'cash' },
    invoinceNo: { type: String, required: true, unique: true },
    recoredBy: {  type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true});

export default mongoose.model<IPayment>('Payment', paymentSchema)
import mongoose, { Document, Mongoose, Schema, Types } from "mongoose";

export interface ISubsciption extends Document {
    member: Types.ObjectId;
    plan:Types.ObjectId;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'expired' | 'cancelled'
}

const subscriptionSchema = new Schema<ISubsciption>({
    member: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: Schema.Types.ObjectId,
        ref: 'MembershipPlan',
        required:true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate : {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    }
}, { timestamps: true });

export default mongoose.model<ISubsciption>('Subscription', subscriptionSchema);
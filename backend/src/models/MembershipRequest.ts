import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMembershipRequest extends Document {
    name: string;
    email: string;
    phone: string;
    interestedPlan: Types.ObjectId;
    status: 'pending' | 'approved' | 'rejected';
    message?:string;
    createdAt: Date;
}

const membershipRequestShema = new Schema<IMembershipRequest>({
    name : {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email : {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true
    },
    phone : {
        type: String,
        required: [true, 'Please provide your phone']
    },
    interestedPlan: {
        type: Schema.Types.ObjectId,
        ref: 'MembershipPlan',
        required: [ true, 'Please select a plan you are interedted in']
    },
    status: {
        type: String,
        enum: ['pending' , 'approved', 'rejected'],
        default: 'pending'
    },
    message: { type: String }
}, { timestamps: true });

export default mongoose.model<IMembershipRequest>('MembershipRequest', membershipRequestShema);
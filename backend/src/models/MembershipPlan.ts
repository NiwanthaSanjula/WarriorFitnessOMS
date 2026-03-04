import mongoose, { Document, Schema } from "mongoose";

export interface IMembershipPlan extends Document {
    name: string;
    price:number
    durationDays: number;
    features: string[]
    description?:string;
    isActive: boolean
    
}

const membershipPlanSchema = new Schema<IMembershipPlan>({
    name: {
        type: String,
        required: [true, 'Plan name is required'],
        unique: true,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Plan price is required'],
    },
    durationDays:{
        type: Number,
        required: [true, 'Duration in days in required']
    },
    description: { type: String },
    features: {
        type: [String],
        default: []
    },
    isActive: { type: Boolean, default: true}
}, { timestamps: true })

export default mongoose.model<IMembershipPlan>('MembershipPlan', membershipPlanSchema);